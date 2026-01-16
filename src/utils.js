import yaml from 'js-yaml';

// 1. JSON 转 YAML
export const jsonToYaml = (jsonStr) => {
  try {
    const obj = JSON.parse(jsonStr);
    return yaml.dump(obj);
  } catch (e) {
    return `Error: ${e.message}`;
  }
};

// 2. YAML 转 JSON
export const yamlToJson = (yamlStr) => {
  try {
    const obj = yaml.load(yamlStr);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return `Error: ${e.message}`;
  }
};

// 3. JSON 转 SQL (简单的 Key-Value 映射)
export const jsonToSql = (jsonStr) => {
  try {
    const data = JSON.parse(jsonStr);
    const items = Array.isArray(data) ? data : [data];
    
    if (items.length === 0) return '-- No data found';

    const tableName = 'table_name';
    const keys = Object.keys(items[0]);
    
    // 生成 CREATE TABLE 语句
    let sql = `CREATE TABLE ${tableName} (\n`;
    sql += keys.map(k => `  ${k} VARCHAR(255)`).join(',\n');
    sql += '\n);\n\n';

    // 生成 INSERT 语句
    sql += `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES\n`;
    const values = items.map(item => {
      const vals = keys.map(k => {
        const val = item[k];
        return typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
      });
      return `(${vals.join(', ')})`;
    }).join(',\n');
    sql += ';';

    return sql;
  } catch (e) {
    return `-- Error: Ensure JSON is an array of objects for SQL conversion.\n-- ${e.message}`;
  }
};