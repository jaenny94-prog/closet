import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Tag,
  Sparkles,
  Layers,
  FolderHeart,
} from 'lucide-react';
import { CustomCategory, ClothingItem } from '../../types/closet';
import { ThemeStyles } from '../../utils/themeSystem';

interface CustomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CustomCategory[];
  items: ClothingItem[];
  onAddCategory: (name: string, emoji?: string, color?: string) => void;
  onUpdateCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  theme: ThemeStyles;
}

const EMOJI_PRESETS = ['⭐', '💍', '🔥', '✨', '💼', '☕', '🌿', '🎉', '✈️', '🏃'];
const COLOR_PRESETS = [
  '#FEF08A', // Butter Yellow
  '#FFCED8', // Blossom Pink
  '#FED7AA', // Peach Apricot
  '#DDD6FE', // Soft Lavender
  '#BAE6FD', // Sky Ice
  '#BBF7D0', // Mint
  '#E2E8F0', // Neutral Slate
];

export const CustomCategoryModal: React.FC<CustomCategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  items,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  theme,
}) => {
  const [newName, setNewName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('⭐');
  const [selectedColor, setSelectedColor] = useState('#FEF08A');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // Append emoji if not already in string
    const finalName = newName.includes(selectedEmoji)
      ? newName.trim()
      : `${newName.trim()} ${selectedEmoji}`;

    onAddCategory(finalName, selectedEmoji, selectedColor);
    setNewName('');
  };

  const handleStartEdit = (cat: CustomCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      onUpdateCategory(id, editingName.trim());
    }
    setEditingId(null);
  };

  // Helper to count clothes in each custom category
  const getItemCount = (catId: string, catName: string) => {
    return items.filter(
      (item) =>
        item.status === 'active' &&
        Array.isArray(item.customCategories) &&
        (item.customCategories.includes(catId) || item.customCategories.includes(catName))
    ).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg ${theme.cardBg} rounded-3xl shadow-modern-float max-h-[90vh] flex flex-col overflow-hidden border ${theme.cardBorder}`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b ${theme.cardBorder} flex items-center justify-between ${theme.cardInnerBg}`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl ${theme.accentLight} flex items-center justify-center ${theme.accentText} shadow-2xs`}
            >
              <FolderHeart className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${theme.textPrimary} leading-tight`}>
                나만의 옷장 컬렉션 관리
              </h2>
              <p className={`text-xs ${theme.textSecondary}`}>
                자유롭게 테마별 태그를 만들고 옷들을 그룹화하세요
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full ${theme.cardBg} hover:opacity-80 flex items-center justify-center ${theme.textSecondary} transition-all`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Add Category Form */}
          <form
            onSubmit={handleAdd}
            className={`p-4 rounded-2xl ${theme.cardInnerBg} border ${theme.cardBorder} space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${theme.textPrimary} flex items-center gap-1`}>
                <Plus className="w-3.5 h-3.5" />
                새 컬렉션 태그 추가
              </span>
              <span className={`text-[10px] ${theme.textSecondary}`}>
                예: 페이보릿 ⭐, 결혼식/하객룩 💍, 승부복 🔥
              </span>
            </div>

            {/* Input with submit button */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="새 컬렉션 이름 (예: 데일리 출근룩, 명품옷)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={`flex-1 px-3 py-2 text-xs rounded-xl border ${theme.cardBorder} ${theme.cardBg} ${theme.textPrimary} focus:outline-none focus:ring-2 focus:ring-current`}
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl ${theme.accentPrimary} text-white shadow-modern-sm disabled:opacity-40 transition-all active:scale-95 shrink-0 flex items-center gap-1`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </div>

            {/* Emoji & Color Pickers */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5 dark:border-white/5">
              {/* Emojis */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                {EMOJI_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-black/10 dark:bg-white/20 scale-110 font-bold'
                        : 'hover:bg-black/5 opacity-70'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Colors */}
              <div className="flex items-center gap-1 shrink-0">
                {COLOR_PRESETS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`w-4 h-4 rounded-full border border-black/10 transition-all ${
                      selectedColor === col ? 'ring-2 ring-black/40 scale-125' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold ${theme.textPrimary}`}>
                보유 컬렉션 ({categories.length}개)
              </span>
              <span className={`text-[10px] ${theme.textSecondary}`}>
                옷 등록 시 복수로 선택할 수 있습니다
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="p-6 text-center text-xs opacity-60">
                등록된 커스텀 컬렉션이 없습니다. 상단에서 추가해 보세요!
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const count = getItemCount(cat.id, cat.name);
                  const isEditing = editingId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className={`p-3 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} hover:shadow-2xs transition-all flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Color swatch / emoji pill */}
                        <span
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-2xs shrink-0 font-medium"
                          style={{
                            backgroundColor: cat.color || '#FEF08A',
                            color: '#2D1E22',
                          }}
                        >
                          {cat.emoji || '⭐'}
                        </span>

                        {/* Name or Edit Input */}
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className={`flex-1 px-2.5 py-1 text-xs rounded-lg border ${theme.cardBorder} ${theme.cardBg} ${theme.textPrimary} focus:outline-none`}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(cat.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-gray-200 text-gray-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <h4 className={`text-xs font-bold ${theme.textPrimary} truncate`}>
                              {cat.name}
                            </h4>
                            <p className={`text-[10px] ${theme.textSecondary}`}>
                              {count}벌의 옷이 포함됨
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            title="이름 수정"
                            className={`p-1.5 rounded-lg hover:${theme.cardInnerBg} ${theme.textSecondary} transition-colors`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCategory(cat.id)}
                            title="컬렉션 삭제"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${theme.cardBorder} ${theme.cardInnerBg} flex justify-end`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-bold rounded-xl ${theme.accentPrimary} text-white shadow-2xs`}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
};
