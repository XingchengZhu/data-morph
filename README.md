<div align="center">

  # 🔄 Data Morph
  
  **The missing converter for developers. JSON, YAML, SQL in one place.**
  <br>
  **开发者专属的数据格式转换工厂。支持 JSON/YAML/SQL 实时互转。**

  [![React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://react.dev)
  [![Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind%20v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
  
  [**🚀 Live Demo / 在线使用**](https://data-morph.vercel.app)
  
  <br>
</div>

---

![App Screenshot](public/screenshot.png)

## 📖 Introduction

**Data Morph** solves the daily headache of converting data formats. 
Whether you need to turn a backend API response (JSON) into a Kubernetes config (YAML), or generate SQL Insert statements from a dataset, Data Morph handles it instantly in your browser.

**Data Morph** 解决了开发者日常的数据格式转换痛点。无论你是要将 API 响应转为 K8s 配置，还是将 JSON 数据生成 SQL 插入语句，它都能在浏览器中瞬间完成。

## ⚡ Features

* **⚡ Real-time Conversion:** Type on the left, see results on the right instantly.
* **🎨 Syntax Highlighting:** Powered by PrismJS for a full IDE-like experience.
* **🛡️ Local Processing:** All data conversion happens in your browser. zero latency, 100% privacy.
* **🔁 Multi-Format:** * JSON ⭢ YAML
    * YAML ⭢ JSON
    * JSON ⭢ SQL (Table Schema + Insert)

## 📦 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/xingchengzhu/data-morph.git
    cd data-morph
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run development server**
    ```bash
    npm run dev
    ```

## 🛠️ Tech Stack

* **Framework:** React 19 + Vite
* **Styling:** Tailwind CSS v4
* **Core Logic:** `js-yaml`
* **Editor:** `react-simple-code-editor` + `prismjs`

## 📄 License

MIT License.

---
<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/xingchengzhu">Xingcheng Zhu</a></sub>
</div>