import { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';

// ✅ 修复 1: 改用核心包按需引入，更稳定
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';

// 图标与组件
import { ArrowRightLeft, Copy, Check, FileJson, Database, FileCode, Github } from 'lucide-react';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { jsonToYaml, yamlToJson, jsonToSql } from './utils';

// 默认示例数据
const DEFAULT_JSON = JSON.stringify([
  { id: 1, name: "Alice", role: "Admin", active: true },
  { id: 2, name: "Bob", role: "User", active: false }
], null, 2);

// 安全高亮函数
const safeHighlight = (code, lang) => {
  if (!code) return '';
  const grammar = Prism.languages[lang] || Prism.languages.clike || Prism.languages.javascript;
  if (!grammar) return code;
  return Prism.highlight(code, grammar, lang);
};

function App() {
  const [input, setInput] = useState(DEFAULT_JSON);
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('JSON_TO_YAML');
  const [copied, setCopied] = useState(false);
  const [jsonViewData, setJsonViewData] = useState(null);

  useEffect(() => {
    let res = '';
    try {
      if (mode === 'JSON_TO_YAML') {
        res = jsonToYaml(input);
      } else if (mode === 'YAML_TO_JSON') {
        res = yamlToJson(input);
        try { 
          const parsed = JSON.parse(res);
          setJsonViewData(typeof parsed === 'object' ? parsed : null); 
        } catch(e) { 
          setJsonViewData(null); 
        }
      } else if (mode === 'JSON_TO_SQL') {
        res = jsonToSql(input);
      }
      setOutput(String(res));
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    }
  }, [input, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInputLangKey = () => mode === 'YAML_TO_JSON' ? 'yaml' : 'json';
  const getOutputLangKey = () => {
    if (mode === 'YAML_TO_JSON') return 'json';
    if (mode === 'JSON_TO_SQL') return 'sql';
    return 'yaml';
  };

  // 辅助函数：生成按钮样式
  const getBtnClass = (active) => `flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
    active ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
  }`;

  // 辅助函数：切换逻辑
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (output && !output.startsWith('Error') && !output.startsWith('--')) {
      setInput(output);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 font-sans text-slate-300">
      
      {/* 顶部导航栏 */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
            <ArrowRightLeft size={20} />
          </div>
          <h1 className="font-bold text-lg text-slate-100 tracking-tight">Data Morph</h1>
        </div>

        {/* ✅ 修复 2: 手动渲染按钮，彻底解决 Object as child 报错 */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleModeChange('JSON_TO_YAML')}
            className={getBtnClass(mode === 'JSON_TO_YAML')}
          >
            <FileCode size={14} /> JSON ⭢ YAML
          </button>
          
          <button
            onClick={() => handleModeChange('YAML_TO_JSON')}
            className={getBtnClass(mode === 'YAML_TO_JSON')}
          >
            <FileJson size={14} /> YAML ⭢ JSON
          </button>
          
          <button
            onClick={() => handleModeChange('JSON_TO_SQL')}
            className={getBtnClass(mode === 'JSON_TO_SQL')}
          >
            <Database size={14} /> JSON ⭢ SQL
          </button>
        </div>

        <a href="https://github.com/xingchengzhu" target="_blank" className="text-slate-500 hover:text-white transition-colors">
          <Github size={20} />
        </a>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 左侧：输入区 */}
        <div className="flex-1 flex flex-col border-r border-slate-800 min-w-0">
          <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Input ({mode.split('_')[0]})</span>
            <span className="text-blue-400">Editable</span>
          </div>
          <div className="flex-1 overflow-auto bg-slate-950 relative group">
            <Editor
              value={String(input)} // ✅ 强制转字符串
              onValueChange={setInput}
              highlight={code => safeHighlight(code, getInputLangKey())}
              padding={24}
              className="font-mono text-sm min-h-full"
              textareaClassName="focus:outline-none"
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* 右侧：输出区 */}
        <div className="flex-1 flex flex-col bg-slate-900/30 min-w-0">
          <div className="h-10 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Output ({mode.split('_')[2]})</span>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                copied ? 'text-green-400 bg-green-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          
          <div className="flex-1 overflow-auto relative">
             {/* 仅在 YAML 转 JSON 且解析成功时显示树状图 */}
             {mode === 'YAML_TO_JSON' && jsonViewData ? (
               <div className="p-6">
                 <JsonView 
                    value={jsonViewData} 
                    style={vscodeTheme} 
                    displayDataTypes={false} 
                    shortenTextAfterLength={50}
                 />
               </div>
             ) : (
               <Editor
                value={String(output)} // ✅ 强制转字符串
                onValueChange={() => {}} 
                highlight={code => safeHighlight(code, getOutputLangKey())}
                padding={24}
                className="font-mono text-sm min-h-full"
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: 14,
                  opacity: 0.8 
                }}
                readOnly
              />
             )}
          </div>
        </div>

      </div>
      
      {/* 底部状态栏 */}
      <div className="h-6 bg-blue-600 text-white text-[10px] flex items-center justify-between px-4 font-mono">
        <span>Ready</span>
        <span>Ln {String(input).split('\n').length}, Col 1</span>
      </div>
    </div>
  );
}

export default App;