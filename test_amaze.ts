
async function test() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/amazeyourself/m3u/refs/heads/main/jtv.m3u');
    const text = await res.text();
    console.log(text.slice(0, 1000));
  } catch (e) {
    console.error(e);
  }
}
test();
