import React, { useRef, useState } from 'react';
import {
  Download,
  FileUp,
  FolderOpen,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { getTemplateById } from '../engine/templates';
import {
  DimensionValues,
  SavedProject,
  TechnicalSettings,
  TemplateDefinition,
  Unit,
} from '../types/dieline';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: SavedProject[];
  onSaveCurrentProject: (name: string) => void;
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
  onImportJson: (jsonStr: string) => void;
  currentTemplate: TemplateDefinition;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  onSaveCurrentProject,
  onLoadProject,
  onDeleteProject,
  onImportJson,
  currentTemplate,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onSaveCurrentProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportJson(content);
          onClose();
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Saved Projects
              </h2>
              <p className="text-xs text-neutral-400">
                Local browser storage & JSON project management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Save current project form */}
          <form onSubmit={handleSave} className="space-y-2 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800">
            <label className="font-semibold text-neutral-300 block">
              Save Current Workspace
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`e.g. My ${currentTemplate.name}...`}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-1 h-8 bg-neutral-900 border border-neutral-700 rounded px-2.5 text-white placeholder-neutral-500 text-xs focus:outline-hidden focus:border-rose-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 h-8 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </form>

          {/* Import JSON button */}
          <div className="flex items-center justify-between p-3 bg-neutral-950/40 rounded-lg border border-neutral-800">
            <div>
              <span className="font-semibold text-neutral-300 block">Import Project File</span>
              <span className="text-[11px] text-neutral-500">Upload a saved .dieline.json file</span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.dieline.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Saved Projects List */}
          <div className="space-y-2">
            <span className="font-semibold text-neutral-300 block">
              Local Projects ({savedProjects.length})
            </span>

            {savedProjects.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 bg-neutral-950/20 rounded-lg border border-dashed border-neutral-800">
                <p>No saved projects yet.</p>
                <p className="text-[11px] mt-1 text-neutral-600">
                  Save your current parameters above to quickly access them later.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedProjects.map((p) => {
                  const tpl = getTemplateById(p.templateId);
                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-neutral-950/60 hover:bg-neutral-800/40 border border-neutral-800 rounded-lg flex items-center justify-between gap-3 transition-colors"
                    >
                      <div
                        onClick={() => {
                          onLoadProject(p);
                          onClose();
                        }}
                        className="flex-1 cursor-pointer"
                      >
                        <h4 className="font-semibold text-white text-xs hover:text-rose-400 transition-colors">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                          <span>{tpl ? tpl.name : p.templateId}</span>
                          <span aria-hidden="true">·</span>
                          <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onLoadProject(p);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-rose-600 hover:text-white text-neutral-300 text-[11px] font-medium transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => onDeleteProject(p.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
