import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    if (!latex) return '';
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (err) {
      return latex;
    }
  }, [latex, displayMode]);

  return (
    <span
      className={`font-mono ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
