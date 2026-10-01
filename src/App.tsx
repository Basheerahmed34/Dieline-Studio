import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  Download,
  FolderOpen,
  Grid,
  Layers,
  Maximize2,
  Package,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { ExportModal } from './components/ExportModal';
import { Header } from './components/Header';
import { PrototypeVerificationModal } from './components/PrototypeVerificationModal';
import { SavedProjectsModal } from './components/SavedProjectsModal';
import { Sidebar } from './components/Sidebar';
import { TemplateCatalogModal } from './components/TemplateCatalogModal';
import { TemplateGallery } from './components/TemplateGallery';
import { Workspace } from './components/Workspace';
import { useAuth } from './context/AuthContext';
import { ALL_TEMPLATES, getTemplateById } from './engine/templates';
import { db } from './firebase';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  DimensionValues,
  LayerVisibility,
  SavedProject,
  TechnicalSettings,
  TemplateDefinition,
  Unit,
} from './types/dieline';

const DEFAULT_SETTINGS: TechnicalSettings = {
  bleed: 3,
  safeArea: 3,
  caliper: 0.4,
  glueFlapWidth: 15,
  showGrainDirection: false,
  colorScheme: 'blue-yellow-white',
};

const DEFAULT_LAYERS: LayerVisibility = {
  cut: true,
  crease: true,
  bleed: true,
  safeArea: true,
  glue: true,
  dimensions: true,
  annotations: true,
  rulers: true,
  grid: true,
};

const INITIAL_PROJECTS: SavedProject[] = [
  {
    id: 'sample-cosmetic-box',
    name: 'Luxury Facial Serum Carton',
    templateId: 'straight-tuck-end',
    dimensions: { width: 38, height: 115, depth: 38 },
    settings: { ...DEFAULT_SETTINGS, bleed: 3, caliper: 0.4 },
    unit: 'mm',
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'sample-mailer-box',
    name: 'E-Commerce DTC Unboxing Mailer',
    templateId: 'roll-end-tuck-top',
    dimensions: { width: 240, height: 180, depth: 60 },
    settings: { ...DEFAULT_SETTINGS, bleed: 3, caliper: 1.5 },
    unit: 'mm',
    updatedAt: Date.now() - 7200000,
  },
  {
    id: 'sample-coffee-pouch',
    name: 'Artisan Roast Stand-Up Pouch',
    templateId: 'stand-up-pouch',
    dimensions: { width: 140, height: 210, gusset: 35 },
    settings: { ...DEFAULT_SETTINGS, bleed: 2 },
    unit: 'mm',
    updatedAt: Date.now() - 10800000,
  },
];

export default function App() {
  // Current active template
  const [templateId, setTemplateId] = useState<string>('straight-tuck-end');
  const template = useMemo(() => getTemplateById(templateId) || ALL_TEMPLATES[0], [templateId]);

  // Current project name
  const [projectName, setProjectName] = useState<string>('My Packaging Dieline');

  // Dimensions state (values stored internally in millimeters)
  const [dimensions, setDimensions] = useState<DimensionValues>(() => {
    const init: DimensionValues = {};
    template.dimensions.forEach((d) => {
      init[d.key] = d.defaultVal;
    });
    return init;
  });

  // Settings & Layers
  const [settings, setSettings] = useState<TechnicalSettings>(DEFAULT_SETTINGS);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [unit, setUnit] = useState<Unit>('mm');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Authentication & Verification
  const { user } = useAuth();
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isNoticeVerified, setIsNoticeVerified] = useState(() => {
    try {
      return localStorage.getItem('dieline_engineering_prototype_verified') === 'true';
    } catch {
      return false;
    }
  });

  // Modals state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'canvas' | 'controls'>('canvas');
  const [viewMode, setViewMode] = useState<'gallery' | 'studio'>('gallery');

  // Saved projects from localStorage and Firestore Database
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const stored = localStorage.getItem('dieline_studio_saved_projects');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_PROJECTS;
  });

  // Real-time synchronization with Firebase Firestore Database when user is logged in
  useEffect(() => {
    if (!user) return;

    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', user.id)
      );

      const unsubscribe = onSnapshot(
        projectsQuery,
        (snapshot) => {
          const remoteProjects: SavedProject[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteProjects.push({
              id: docSnap.id,
              name: data.name,
              templateId: data.templateId,
              dimensions: data.dimensions,
              settings: data.settings,
              unit: data.unit,
              updatedAt: data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now(),
            });
          });

          if (remoteProjects.length > 0) {
            setSavedProjects(remoteProjects);
          }
        },
        (error) => {
          console.warn('Firestore real-time sync notice (using local storage):', error);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to attach Firestore project listener:', err);
    }
  }, [user]);

  // Save projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dieline_studio_saved_projects', JSON.stringify(savedProjects));
    } catch {}
  }, [savedProjects]);

  // Workspace fit callback ref
  const fitRef = useRef<(() => void) | null>(null);

  // Template switch handler
  const handleSelectTemplate = useCallback((newTemplate: TemplateDefinition) => {
    setTemplateId(newTemplate.id);
    const newDims: DimensionValues = {};
    newTemplate.dimensions.forEach((d) => {
      newDims[d.key] = d.defaultVal;
    });
    setDimensions(newDims);
    setProjectName(`My ${newTemplate.name}`);
    setTimeout(() => {
      fitRef.current?.();
    }, 50);
  }, []);

  // Dimension value change
  const handleDimensionChange = useCallback((key: string, valMm: number) => {
    setDimensions((prev) => ({
      ...prev,
      [key]: Math.max(1, Number.isFinite(valMm) ? valMm : 10),
    }));
  }, []);

  // Setting change
  const handleSettingChange = useCallback(<K extends keyof TechnicalSettings>(key: K, val: TechnicalSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: val,
    }));
  }, []);

  // Layer toggle
  const handleLayerToggle = useCallback((layerKey: keyof LayerVisibility) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  }, []);

  // Reset to template defaults
  const handleReset = useCallback(() => {
    const defaultDims: DimensionValues = {};
    template.dimensions.forEach((d) => {
      defaultDims[d.key] = d.defaultVal;
    });
    setDimensions(defaultDims);
    setSettings(DEFAULT_SETTINGS);
    setTimeout(() => {
      fitRef.current?.();
    }, 50);
  }, [template]);

  // Save current project (Stores locally and syncs to Firebase Firestore)
  const handleSaveCurrentProject = useCallback(async (name: string) => {
    const newProject: SavedProject = {
      id: `project-${Date.now()}`,
      name,
      templateId,
      dimensions,
      settings,
      unit,
      updatedAt: Date.now(),
    };
    setSavedProjects((prev) => [newProject, ...prev]);
    setProjectName(name);

    // Save to Firebase Firestore Database if user is authenticated
    if (user) {
      try {
        await setDoc(doc(db, 'projects', newProject.id), {
          id: newProject.id,
          userId: user.id,
          name: newProject.name,
          templateId: newProject.templateId,
          dimensions: newProject.dimensions,
          settings: newProject.settings,
          unit: newProject.unit,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to sync saved project to Firestore:', err);
      }
    }
  }, [templateId, dimensions, settings, unit, user]);

  // Load project
  const handleLoadProject = useCallback((p: SavedProject) => {
    const targetTemplate = getTemplateById(p.templateId);
    if (targetTemplate) {
      setTemplateId(p.templateId);
      setDimensions(p.dimensions);
      if (p.settings) setSettings(p.settings);
      if (p.unit) setUnit(p.unit);
      setProjectName(p.name);
      setTimeout(() => {
        fitRef.current?.();
      }, 50);
    }
  }, []);

  // Delete project (Deletes locally and from Firebase Firestore)
  const handleDeleteProject = useCallback(async (id: string) => {
    setSavedProjects((prev) => prev.filter((p) => p.id !== id));
    if (user) {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (err) {
        console.warn('Failed to delete project from Firestore:', err);
      }
    }
  }, [user]);

  // Handle verification and prototype confirmation
  const handleAcknowledgeAndSolve = useCallback(() => {
    setIsNoticeVerified(true);
    try {
      localStorage.setItem('dieline_engineering_prototype_verified', 'true');
    } catch {}
  }, []);

  // Import JSON project
  const handleImportJson = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.templateId && data.dimensions) {
        setTemplateId(data.templateId);
        setDimensions(data.dimensions);
        if (data.settings) setSettings(data.settings);
        if (data.unit) setUnit(data.unit);
        if (data.projectName) setProjectName(data.projectName);
        setTimeout(() => {
          fitRef.current?.();
        }, 50);
      }
    } catch (e) {
      console.warn('Unable to parse dieline project JSON file:', e);
    }
  }, []);

  // Generate real vector geometry with validation
  const geometry = useMemo(() => {
    try {
      return template.generator(dimensions, settings);
    } catch (err) {
      console.error('Geometry calculation error:', err);
      // Fallback
      return template.generator(
        template.dimensions.reduce((acc, d) => ({ ...acc, [d.key]: d.defaultVal }), {}),
        settings
      );
    }
  }, [template, dimensions, settings]);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        fitRef.current?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${theme === 'dark' ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Disclaimer Banner */}
      <DisclaimerBanner
        onOpenVerification={() => setIsVerificationOpen(true)}
        isVerified={isNoticeVerified}
      />

      {/* Top Header */}
      <Header
        templateName={template.name}
        categoryName={template.categoryName}
        unit={unit}
        onUnitChange={setUnit}
        onOpenTemplates={() => setIsCatalogOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onFitView={() => fitRef.current?.()}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Viewport Container */}
      {viewMode === 'gallery' ? (
        <TemplateGallery
          onSelectTemplate={(newTpl) => {
            handleSelectTemplate(newTpl);
            setViewMode('studio');
          }}
          currentTemplateId={templateId}
          unit={unit}
          onOpenStudio={() => setViewMode('studio')}
        />
      ) : (
        /* Main Studio Workspace Container */
        <div className="flex-1 flex overflow-hidden relative">
          {/* Center Interactive 2D Vector CAD Canvas */}
          <div className={`flex-1 h-full relative ${mobileTab === 'controls' ? 'hidden md:block' : 'block'}`}>
            <Workspace
              geometry={geometry}
              dimensions={dimensions}
              settings={settings}
              layers={layers}
              unit={unit}
              theme={theme}
              onFitRequestRef={fitRef}
            />
          </div>

          {/* Right Sidebar Inspector & Controls */}
          <div className={`${mobileTab === 'canvas' ? 'hidden md:block' : 'block w-full md:w-auto h-full'}`}>
            <Sidebar
              template={template}
              geometry={geometry}
              dimensions={dimensions}
              onDimensionChange={handleDimensionChange}
              settings={settings}
              onSettingChange={handleSettingChange}
              layers={layers}
              onLayerToggle={handleLayerToggle}
              unit={unit}
              bounds={geometry.bounds}
              onReset={handleReset}
            />
          </div>

          {/* Mobile View Toggle Bar */}
          <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center p-1 bg-neutral-900/95 backdrop-blur-md rounded-full border border-neutral-700 shadow-xl">
            <button
              onClick={() => setMobileTab('canvas')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                mobileTab === 'canvas' ? 'bg-rose-600 text-white font-semibold' : 'text-neutral-400'
              }`}
            >
              2D Canvas
            </button>
            <button
              onClick={() => setMobileTab('controls')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                mobileTab === 'controls' ? 'bg-rose-600 text-white font-semibold' : 'text-neutral-400'
              }`}
            >
              Parameters
            </button>
          </div>
        </div>
      )}

      {/* Template Catalog Modal */}
      <TemplateCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTemplateId={templateId}
      />

      {/* Export Vector Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        template={template}
        geometry={geometry}
        dimensions={dimensions}
        settings={settings}
        unit={unit}
        projectName={projectName}
      />

      {/* Saved Projects Modal */}
      <SavedProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        savedProjects={savedProjects}
        onSaveCurrentProject={handleSaveCurrentProject}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
        onImportJson={handleImportJson}
        currentTemplate={template}
      />

      {/* Pre-Production Prototype Verification Modal */}
      <PrototypeVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        template={template}
        dimensions={dimensions}
        settings={settings}
        bounds={geometry.bounds}
        unit={unit}
        onAcknowledgeAndSolve={handleAcknowledgeAndSolve}
        isVerified={isNoticeVerified}
      />

      {/* Global Authentication Modal (Google / Facebook / Email) */}
      <AuthModal />
    </div>
  );
}
