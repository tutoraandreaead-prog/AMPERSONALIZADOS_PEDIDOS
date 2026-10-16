export class MemoryStore{
 constructor(){this.rows=new Map();this.serial=0}
 async get(key){const row=this.rows.get(key);return row?structuredClone(row.data):null}
 async getWithMetadata(key){const row=this.rows.get(key);return row?{data:structuredClone(row.data),etag:row.etag,metadata:{}}:null}
 async setJSON(key,data,options={}){const current=this.rows.get(key);if(options.onlyIfNew&&current||options.onlyIfMatch&&current?.etag!==options.onlyIfMatch)return {modified:false};const row={data:structuredClone(data),etag:'"'+(++this.serial)+'"'};this.rows.set(key,row);return {modified:true,etag:row.etag}}
 async delete(key){this.rows.delete(key)}
}
