import yaml from 'js-yaml';

// 1. JSON String -> YAML String
export const jsonToYaml = (jsonStr) => {
  try {
    const obj = JSON.parse(jsonStr);
    return yaml.dump(obj);
  } catch (e) {
    return null; // 返回 null 表示失败，交给 UI 处理
  }
};

// 2. YAML String -> JSON String
export const yamlToJson = (yamlStr) => {
  try {
    const obj = yaml.load(yamlStr);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return null;
  }
};

// 3. Object -> SQL String (新加的，方便内部调用)
export const objectToSql = (data) => {
  try {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return '-- No data found';

    const tableName = 'table_name';
    const keys = Object.keys(items[0] || {});
    if (keys.length === 0) return '-- Empty object';
    
    let sql = `CREATE TABLE ${tableName} (\n`;
    sql += keys.map(k => `  ${k} VARCHAR(255)`).join(',\n');
    sql += '\n);\n\n';

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
    return `-- Error generating SQL: ${e.message}`;
  }
};

// 保持旧接口兼容（如果还要用的话）
export const jsonToSql = (jsonStr) => {
  try {
    return objectToSql(JSON.parse(jsonStr));
  } catch (e) {
    return `-- Invalid JSON`;
  }
};