import { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import { objectToSql } from './utils';
import { 
  FileJson, Database, FileCode, Copy, Check, RotateCcw, Zap
} from 'lucide-react';

// 初始数据
const INITIAL_DATA = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "User" }
];

function App() {
  // 1. 当前编辑器里的文本
  const [content, setContent] = useState(JSON.stringify(INITIAL_DATA, null, 2));
  // 2. 当前模式
  const [format, setFormat] = useState('JSON');
  // 3. 后台缓存的“最后一次正确的数据” (Single Source of Truth)
  const [cachedData, setCachedData] = useState(INITIAL_DATA);
  
  const [msg, setMsg] = useState('');

  // 🔴 核心逻辑：每当内容变化，尝试解析并更新缓存
  const handleEditorChange = (val) => {
    setContent(val);
    try {
      let parsed = null;
      if (format === 'JSON') parsed = JSON.parse(val);
      if (format === 'YAML') parsed = yaml.load(val);
      
      // SQL 模式下，通常很难解析回对象，所以我们不更新缓存
      // 这意味着用户在 SQL 模式下的修改是“只读/临时”的
      // 一旦切换走，就会丢弃 SQL 的修改，恢复到 last valid state
      
      if (parsed && typeof parsed === 'object') {
        setCachedData(parsed);
      }
    } catch (e) {
      // 解析失败，只需静默，保持 cachedData 不变（停留在上一个正确版本）
    }
  };

  // 🔵 核心逻辑：切换模式
  const switchFormat = (targetFormat) => {
    if (format === targetFormat) return;

    // 尝试生成目标代码
    let newContent = '';
    try {
      // 总是使用 cachedData 来生成，这就实现了“自动修正/回退到正常状态”
      if (targetFormat === 'JSON') {
        newContent = JSON.stringify(cachedData, null, 2);
      } else if (targetFormat === 'YAML') {
        newContent = yaml.dump(cachedData);
      } else if (targetFormat === 'SQL') {
        newContent = objectToSql(cachedData);
      }
      
      // 切换成功
      setContent(newContent);
      setFormat(targetFormat);
      setMsg(`Switched to ${targetFormat}`);
      setTimeout(() => setMsg(''), 1500);

    } catch (e) {
      setMsg('Error converting!');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setMsg('Copied!');
    setTimeout(() => setMsg(''), 2000);
  };

  // 样式辅助
  const getTabStyle = (target) => `
    flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold transition-all border-t border-x border-transparent
    ${format === target 
      ? 'bg-slate-900 text-blue-400 border-slate-800 border-b-slate-900 translate-y-[1px] z-10' 
      : 'bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}
  `;

  return (
    <div className="h-screen bg-slate-950 text-slate-300 font-sans flex flex-col items-center py-10">
      
      <div className="w-full max-w-4xl flex flex-col h-full px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-white">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white tracking-tight">Data Morph</h1>
              <p className="text-xs text-slate-500 font-mono">Single-Editor Converter</p>
            </div>
          </div>
          
          {msg && (
            <div className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold animate-fade-in flex items-center gap-2">
              <Check size={12} /> {msg}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-end border-b border-slate-800 w-full pl-2 select-none">
          <button onClick={() => switchFormat('JSON')} className={getTabStyle('JSON')}>
            <FileCode size={16} /> JSON
          </button>
          <button onClick={() => switchFormat('YAML')} className={getTabStyle('YAML')}>
            <FileJson size={16} /> YAML
          </button>
          <button onClick={() => switchFormat('SQL')} className={getTabStyle('SQL')}>
            <Database size={16} /> SQL
          </button>
          
          <div className="flex-1"></div>
          
          <button 
            onClick={handleCopy} 
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-white mb-2 transition-colors px-2"
          >
            <Copy size={14} /> Copy Content
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-slate-900 rounded-b-xl rounded-tr-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
          
          {/* 状态指示条 */}
          <div className="h-1 w-full bg-slate-800">
             <div className={`h-full transition-all duration-300 ${
               format === 'JSON' ? 'w-1/3 bg-yellow-500' : 
               format === 'YAML' ? 'w-1/3 ml-[33%] bg-purple-500' : 
               'w-1/3 ml-[66%] bg-blue-500'
             }`}></div>
          </div>

          <textarea
            value={content}
            onChange={(e) => handleEditorChange(e.target.value)}
            className="flex-1 bg-transparent p-8 resize-none outline-none text-sm font-mono leading-relaxed text-slate-300 placeholder-slate-700 custom-scrollbar"
            spellCheck="false"
          />

          {/* 提示信息 */}
          <div className="absolute bottom-4 right-6 text-[10px] text-slate-600 font-mono pointer-events-none">
             {format === 'SQL' ? '⚠️ SQL edits are temporary (Read-only mode)' : '✅ Auto-saving valid state...'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;