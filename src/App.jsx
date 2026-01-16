import { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';

// ✅ 稳健的 Prism 引入：直接引入主包，避免插件加载顺序问题
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // 确保样式被引入
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';

// ❌ 移除 lucide-react，改用 Emoji，排除组件库兼容性问题
// import { ArrowRightLeft, ... } from 'lucide-react';

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
  // 防御性获取语法
  const grammar = Prism.languages[lang] || Prism.languages.javascript || Prism.languages.clike;
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
      // 再次强制转为字符串，确保万无一失
      setOutput(String(res || ''));
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

  // 按钮样式
  const getBtnClass = (active) => `flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
    active ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
  }`;

  // 切换逻辑
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
            {/* 使用 Emoji 替代图标 */}
            <span className="text-xl">🔄</span>
          </div>
          <h1 className="font-bold text-lg text-slate-100 tracking-tight">Data Morph</h1>
        </div>

        {/* 模式切换按钮 */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleModeChange('JSON_TO_YAML')}
            className={getBtnClass(mode === 'JSON_TO_YAML')}
          >
            <span className="text-base">📝</span> JSON ⭢ YAML
          </button>
          
          <button
            onClick={() => handleModeChange('YAML_TO_JSON')}
            className={getBtnClass(mode === 'YAML_TO_JSON')}
          >
            <span className="text-base">📄</span> YAML ⭢ JSON
          </button>
          
          <button
            onClick={() => handleModeChange('JSON_TO_SQL')}
            className={getBtnClass(mode === 'JSON_TO_SQL')}
          >
            <span className="text-base">🗄️</span> JSON ⭢ SQL
          </button>
        </div>

        <a href="https://github.com/xingchengzhu" target="_blank" className="text-slate-500 hover:text-white transition-colors text-xl">
          🐱
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
              value={String(input)}
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
              <span>{copied ? '✅' : '📋'}</span>
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
                value={String(output)}
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