# Daily Met Muse

每天看十件大都会艺术博物馆的藏品，也可以按日历回看。<br>
Discover ten works from The Met each day and revisit past selections by date.

## 本地运行 · Run locally

需要 Node.js 和 npm，已用 Node.js 22 验证。<br>
Requires Node.js and npm. Tested with Node.js 22.

```sh
git clone https://github.com/b3inside/daily-met-muse.git
cd daily-met-muse
npm ci
npm run dev
```

打开终端显示的本地地址，默认是 `http://localhost:8080`。<br>
Open the local URL printed in your terminal. The default is `http://localhost:8080`.

馆藏数据需要联网加载。<br>
An internet connection is required to load the artwork. [The Met Collection API](https://metmuseum.github.io/)
