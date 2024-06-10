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

const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split(".");
  const date =  new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date;
}

export default function MinimalBlogCoreBlog({ ...props }: Props) {
  const {
    data: { allPost },
  } = props

  const sortedPosts = allPost.nodes.sort((a: Dated, b: Dated) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  return <Blog posts={sortedPosts} {...props} />
}

export { Head }
