import * as React from "react"
import Blog, { Head } from "./custom/blog"

type Props = {
  data: {
    allPost: any
    [key: string]: string
  }
  [key: string]: any
}

type Dated = { date: string };

export default function MinimalBlogCoreBlog({ ...props }: Props) {
  const {
    data: { allPost },
  } = props

  const sortedPosts = allPost.nodes.sort((a: Dated, b: Dated) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return <Blog posts={sortedPosts} {...props} />
}

export { Head }
