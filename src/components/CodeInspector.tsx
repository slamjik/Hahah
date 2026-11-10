import React, { useState } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { ChartSettings, SortMode } from '../types.ts';

interface CodeInspectorProps {
  settings: ChartSettings;
  sortMode: SortMode;
  datasetName: string;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  settings,
  sortMode,
  datasetName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const d3Code = `// Observable D3.js Bar Chart Implementation
// Dataset: ${datasetName}
// Sorting Mode: ${sortMode}

function renderBarChart(data) {
  // 1. Specify chart dimensions and margins
  const width = 928;
  const height = ${settings.height};
  const marginTop = ${settings.marginTop};
  const marginRight = ${settings.marginRight};
  const marginBottom = ${settings.marginBottom};
  const marginLeft = ${settings.marginLeft};

  // 2. Declare horizontal X band scale
  const x = d3.scaleBand()
    .domain(data.map(d => d.letter))
    .range([marginLeft, width - marginRight])
    .padding(${settings.barPadding});

  // 3. Declare vertical Y linear scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.frequency)]).nice()
    .range([height - marginBottom, marginTop]);

  // 4. Create the SVG canvas
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  ${settings.showGrid ? `// 5. Add horizontal gridlines
  svg.append("g")
    .attr("stroke", "#e2e8f0")
    .attr("stroke-opacity", 0.7)
    .call(d3.axisLeft(y)
      .tickSize(-width + marginLeft + marginRight)
      .tickFormat("")
    )
    .call(g => g.select(".domain").remove());\n` : ''}
  // 6. Append bars (rectangles)
  svg.append("g")
    .attr("fill", "${settings.colorTheme === 'steelblue' ? 'steelblue' : '#3b82f6'}")
    .selectAll("rect")
    .data(data)
    .join("rect")
      .attr("x", d => x(d.letter))
      .attr("y", d => y(d.frequency))
      .attr("height", d => y(0) - y(d.frequency))
      .attr("width", x.bandwidth())${settings.borderRadius > 0 ? `\n      .attr("rx", ${settings.borderRadius})\n      .attr("ry", ${settings.borderRadius})` : ''};

  // 7. Add X-Axis
  svg.append("g")
    .attr("transform", \`translate(0,\${height - marginBottom})\`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // 8. Add Y-Axis with label
  svg.append("g")
    .attr("transform", \`translate(\${marginLeft},0)\`)
    .call(d3.axisLeft(y).ticks(null, "%"))
    .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("${settings.yAxisLabel}"));

  return svg.node();
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(d3Code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-900 text-neutral-100 font-mono text-xs shadow-xs">
      {/* Header bar of Observable Cell */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 bg-neutral-800/80 hover:bg-neutral-800 cursor-pointer select-none border-b border-neutral-700/60"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-sky-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
          <Code2 className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-neutral-200">
            D3.js Cell Specification: <span className="text-sky-400">chart = BarChart(data, ...)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400 font-sans hidden sm:inline">
            {isOpen ? 'Click to collapse' : 'Click to view D3 source code'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-200 transition-colors cursor-pointer text-[11px]"
            title="Copy D3 JavaScript code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-sans">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-sans">Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      {isOpen && (
        <div className="p-4 bg-neutral-950 overflow-x-auto text-[11px] leading-relaxed text-neutral-300">
          <pre>{d3Code}</pre>
        </div>
      )}
    </div>
  );
};
