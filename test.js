let a=fetch('styles.css');
console.log(a);
a.then((res) => res.text()).then((data)=>console.log(data));
