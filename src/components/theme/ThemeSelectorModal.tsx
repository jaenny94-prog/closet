import React from 'react';
import { X, Check, Palette, Sparkles, Moon, Sun } from 'lucide-react';
import { AppThemeId } from '../../types/closet';
import { THEME_LIST, ThemeStyles } from '../../utils/themeSystem';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: AppThemeId;
  onSelectTheme: (themeId: AppThemeId) => void;
  theme: ThemeStyles;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md ${theme.cardBg} rounded-3xl shadow-modern-float max-h-[90vh] flex flex-col overflow-hidden border ${theme.cardBorder}`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b ${theme.cardBorder} flex items-center justify-between ${theme.cardInnerBg}`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl ${theme.accentLight} flex items-center justify-center ${theme.accentText} shadow-2xs`}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${theme.textPrimary} leading-tight`}>
                실시간 UI 테마 설정
              </h2>
              <p className={`text-xs ${theme.textSecondary}`}>
                원하는 감성의 색조합을 선택하면 즉시 적용됩니다
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

        {/* Theme List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {THEME_LIST.map((t) => {
            const isSelected = currentThemeId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? `${t.cardInnerBg} border-2 ${t.cardBorder} shadow-modern-sm ring-2 ring-current/20 scale-[1.01]`
                    : `${theme.cardBg} hover:${theme.cardInnerBg} ${theme.cardBorder} hover:scale-[1.005]`
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Swatches circle group */}
                  <div className="flex -space-x-1.5 shrink-0 p-1 rounded-xl bg-black/5 dark:bg-white/5">
                    {t.previewColors.map((col, idx) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>

                  {/* Theme Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3
                        className={`text-xs font-bold ${
                          isSelected ? t.textPrimary : theme.textPrimary
                        } truncate`}
                      >
                        {t.name}
                      </h3>
                      {t.isDark ? (
                        <Moon className="w-3 h-3 text-cyan-400 shrink-0" />
                      ) : (
                        <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <p
                      className={`text-[11px] ${
                        isSelected ? t.textSecondary : theme.textSecondary
                      } truncate mt-0.5`}
                    >
                      {t.subtitle}
                    </p>
                  </div>
                </div>

                {/* Selected Indicator */}
                <div className="shrink-0">
                  {isSelected ? (
                    <span
                      className={`w-6 h-6 rounded-full ${t.accentPrimary} text-white flex items-center justify-center shadow-2xs animate-in zoom-in-75`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span
                      className={`w-6 h-6 rounded-full border ${theme.cardBorder} flex items-center justify-center hover:bg-black/5`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div
          className={`p-3.5 border-t ${theme.cardBorder} ${theme.cardInnerBg} flex items-center justify-between text-xs`}
        >
          <span className={`text-[11px] ${theme.textSecondary}`}>
            선택한 테마는 로컬 브라우저에 자동 저장됩니다.
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl ${theme.accentPrimary} text-white shadow-2xs`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
