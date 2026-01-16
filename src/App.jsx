import { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';
import { ArrowRightLeft, Copy, Check, FileJson, Database, FileCode, Github } from 'lucide-react';
import JsonView from '@uiw/react-json-view'; // ✅ 新库
import { vscodeTheme } from '@uiw/react-json-view/vscode'; // ✅ 引入 VSCode 风格主题
import { jsonToYaml, yamlToJson, jsonToSql } from './utils';

// 默认示例数据
const DEFAULT_JSON = JSON.stringify([
  { id: 1, name: "Alice", role: "Admin", active: true },
  { id: 2, name: "Bob", role: "User", active: false }
], null, 2);

function App() {
  const [input, setInput] = useState(DEFAULT_JSON);
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('JSON_TO_YAML'); // 'JSON_TO_YAML' | 'YAML_TO_JSON' | 'JSON_TO_SQL'
  const [copied, setCopied] = useState(false);
  const [jsonViewData, setJsonViewData] = useState(null); // 用于 JSON 可视化模式

  // 核心转换 Effect
  useEffect(() => {
    let res = '';
    try {
      if (mode === 'JSON_TO_YAML') {
        res = jsonToYaml(input);
      } else if (mode === 'YAML_TO_JSON') {
        res = yamlToJson(input);
        // 尝试解析为对象以供视图展示
        try { setJsonViewData(JSON.parse(res)); } catch(e) { setJsonViewData(null); }
      } else if (mode === 'JSON_TO_SQL') {
        res = jsonToSql(input);
      }
      setOutput(res);
    } catch (e) {
      setOutput(e.message);
    }
  }, [input, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 根据模式获取编辑器语言配置
  const getInputLang = () => mode === 'YAML_TO_JSON' ? languages.yaml : languages.json;
  const getOutputLang = () => {
    if (mode === 'YAML_TO_JSON') return languages.json;
    if (mode === 'JSON_TO_SQL') return languages.sql;
    return languages.yaml;
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 font-sans text-slate-300">
      
      {/* 🟢 顶部导航栏 */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
            <ArrowRightLeft size={20} />
          </div>
          <h1 className="font-bold text-lg text-slate-100 tracking-tight">Data Morph</h1>
        </div>

        {/* 模式切换器 */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'JSON_TO_YAML', label: 'JSON ⭢ YAML', icon: FileCode },
            { id: 'YAML_TO_JSON', label: 'YAML ⭢ JSON', icon: FileJson },
            { id: 'JSON_TO_SQL', label: 'JSON ⭢ SQL', icon: Database },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { 
                setMode(m.id); 
                // 切换模式时，尝试把 output 作为下一次的 input (如果格式兼容)
                if (output && !output.startsWith('Error') && !output.startsWith('--')) {
                   setInput(output);
                }
              }} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === m.id 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <m.icon size={14} /> {m.label}
            </button>
          ))}
        </div>

        <a href="https://github.com/xingchengzhu" target="_blank" className="text-slate-500 hover:text-white transition-colors">
          <Github size={20} />
        </a>
      </header>

      {/* 🔵 主内容区：双栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 左侧：输入区 */}
        <div className="flex-1 flex flex-col border-r border-slate-800 min-w-0">
          <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Input ({mode.split('_')[0]})</span>
            <span className="text-blue-400">Editable</span>
          </div>
          <div className="flex-1 overflow-auto bg-slate-950 relative group">
            <Editor
              value={input}
              onValueChange={setInput}
              highlight={code => highlight(code, getInputLang() || languages.text)}
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
            <div className="flex gap-2">
               {/* 只有在 YAML 转 JSON 模式下才显示 Tree View 开关，这里默认只要是 JSON 结果都可以在下方展示树状图 */}
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
          </div>
          
          <div className="flex-1 overflow-auto relative">
             {/* 如果模式产生的是 JSON (YAML -> JSON)，我们可以额外展示一个树状视图 */}
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
                value={output}
                onValueChange={() => {}} // ReadOnly
                highlight={code => highlight(code, getOutputLang() || languages.text)}
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
        <span>Ln {input.split('\n').length}, Col 1</span>
      </div>
    </div>
  );
}

export default App;