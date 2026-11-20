/**
 * Based on the discussion at https://github.com/expressive-code/expressive-code/issues/153#issuecomment-2282218684
 */
/**
 * Expressive Code 语言徽标插件
 * 把代码块语言写入 .frame 的 data-language 属性，并通过 ::after 在右上角显示语言名（hover 时隐去）。
 */
import { definePlugin } from "@expressive-code/core";

/** 注册插件：渲染后补充语言属性并注入徽标样式 */
export function pluginLanguageBadge() {
	return definePlugin({
		name: "Language Badge",
		hooks: {
			postprocessRenderedBlock: ({ codeBlock, renderData }) => {
				// 把语言信息添加到 .frame 上
				const language = codeBlock.language;
				if (language && renderData.blockAst.properties) {
					renderData.blockAst.properties["data-language"] = language;
				}
			},
		},
		baseStyles: ({}) => `
      .frame[data-language]:not(.has-title):not(.is-terminal) {
        position: relative;
        
        &::after {
          position: absolute;
          z-index: 2;
          right: 0.5rem;
          top: 0.5rem;
          padding: 0.1rem 0.5rem;
          content: attr(data-language);
          font-family: "JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          color: var(--btn-content);
          background: var(--btn-regular-bg);
          border-radius: 0.5rem;
          pointer-events: none;
          transition: opacity 0.3s;
          opacity: 0;
        }
        
        @media (hover: hover) {
          &::after {
            opacity: 1;
          }
          &:hover::after {
            opacity: 0;
          }
        }
      }
    `,
	});
}
