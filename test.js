const s = "    123\t2026-08-03 18:22:14\t12\t1\t1\t0";
const m = s.trim().match(/^(\d+)[\s,]+(\d{4}[-/]\d{1,2}[-/]\d{1,2}[\sT]+\d{1,2}:\d{2}:\d{2})/);
console.log(m ? [m[1], m[2]] : null);
