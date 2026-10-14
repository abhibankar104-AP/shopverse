/* ShopVerse demo catalogue overrides. localStorage is not a secure database. */
window.ShopCatalog = (() => {
  const OVERRIDES='shopverse-product-overrides', DELETED='shopverse-deleted-products';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  function all(base){const source=base||[],overrides=read(OVERRIDES,{}),deleted=new Set(read(DELETED,[])),baseIds=new Set(source.map(p=>p.id));return source.filter(p=>!deleted.has(p.id)).map(p=>({...p,...(overrides[p.id]||{})})).concat(Object.entries(overrides).filter(([id])=>!baseIds.has(id)&&!deleted.has(id)).map(([,p])=>p));}
  function save(product){const overrides=read(OVERRIDES,{});overrides[product.id]={...product,isNew:product.isNew||overrides[product.id]?.isNew||false};localStorage.setItem(OVERRIDES,JSON.stringify(overrides));const deleted=read(DELETED,[]).filter(id=>id!==product.id);localStorage.setItem(DELETED,JSON.stringify(deleted));}
  function remove(id){const overrides=read(OVERRIDES,{});delete overrides[id];localStorage.setItem(OVERRIDES,JSON.stringify(overrides));const deleted=read(DELETED,[]);if(!deleted.includes(id))deleted.push(id);localStorage.setItem(DELETED,JSON.stringify(deleted));}
  return {all,save,remove,read};
})();
