const fs=require('fs');
const h=fs.readFileSync('web/public/text.html','utf-8');
const m=h.match(/<script>([\s\S]*?)<\/script>/);
try{
  new Function(m[1]);
  console.log('OK');
}catch(e){
  // Find line number
  const lines=m[1].split('\n');
  const errLine=e.stack.match(/:(\d+):/);
  if(errLine){
    const ln=parseInt(errLine[1]);
    console.log('Line',ln,':',lines[ln-1]?.slice(0,80));
  }
  console.log('Error:',e.message.slice(0,100));
}
