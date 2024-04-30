import type { PageProps } from "gatsby"
import * as React from "react"
import Post, { Head, MBPostProps } from "./custom/post"

export default function MinimalBlogCorePost({ ...props }: PageProps<MBPostProps>) {
  return <Post {...props} />
}

export { Head }
