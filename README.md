# p-batcher

[![npm version](https://badgen.net/npm/v/p-batcher)](https://npm.im/p-batcher) [![npm downloads](https://badgen.net/npm/dm/p-batcher)](https://npm.im/p-batcher)

> A promise batcher, collect promises and run them in batch.

<!-- Features: -->
<!--
- Package manager [pnpm](https://pnpm.js.org/), safe and fast
- Release with [semantic-release](https://npm.im/semantic-release)
- Bundle with [tsup](https://github.com/vaakian/tsup)
- Test with [vitest](https://vitest.dev)

To skip CI (GitHub action), add `skip-ci` to commit message. To skip release, add `skip-release` to commit message. -->

## Install

```bash
npm i p-batcher
```

## Usage

```ts
import { createPBatch } from "p-batcher"

const api = createPBatch((keys: number[]) => {
  console.log("batching", keys)
  return keys.map((k) => `res-${k}`)
}, {
  maxBatchSize: 3,
})

const res = await Promise.all([
  api(1),
  api(2),
  api(3),
  api(4),
  api(5),
])

console.log(res)

/*
output:
batching [ 1, 2, 3 ]
batching [ 4, 5 ]
[ 'res-1', 'res-2', 'res-3', 'res-4', 'res-5' ]

*/
```

### Real world example

Fetch multiple posts **in one request** from [JsonPlaceholder](https://jsonplaceholder.typicode.com/)

```ts

import { createPBatch } from "../src"

interface Post {
  userId: number
  id: number
  title: string
  body: string
}

const postApi = createPBatch<number, Post>((postIdList: readonly number[]) => {
  console.log(`fetching posts: ${postIdList}`)

  // here we fetch all posts in one request
  return fetch(
    `https://jsonplaceholder.typicode.com/posts?${postIdList
      .map((id) => `id=${id}`)
      .join("&")}`,
  ).then((res) => res.json())
})

async function main() {
  const posts = await Promise.all([
    // call the api separately
    postApi(1),
    postApi(2),
    postApi(3),
    postApi(4),
    postApi(5),
  ])

  console.log(posts)
}

main()
```
<details>
<summary>Output</summary>

```js
fetching posts: 1,2,3,4,5
[
  {
    userId: 1,
    id: 1,
    title: 'unt aut facere repellat provident',
    body: '...',
  },
  {
    userId: 1,
    id: 2,
    title: 'qui est esse',
    body: '...',
  },
  {
    userId: 1,
    id: 3,
    title: 'ea molestias quasi exercitationem',
    body: '...',
  },
  {
    userId: 1,
    id: 4,
    title: 'eum et est occaecati',
    body: '...',
  },
  {
    userId: 1,
    id: 5,
    title: 'nesciunt quas odio',
    body: '...',
  }
]
```
</details>


## License

MIT &copy; [vaakian](https://github.com/sponsors/vaakian)
