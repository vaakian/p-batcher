// fetch posts from https://jsonplaceholder.typicode.com/posts

import { createPBatch } from "../src"

interface Post {
  userId: number
  id: number
  title: string
  body: string
}

const postApi = createPBatch<number, Post>((ids: readonly number[]) => {
  console.log(`fetching posts: ${ids}`)

  // here we fetch all posts in one request
  return fetch(
    `https://jsonplaceholder.typicode.com/posts?${ids
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
