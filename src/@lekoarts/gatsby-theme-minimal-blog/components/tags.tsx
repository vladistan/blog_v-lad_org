import * as React from "react"
import Tags, { Head } from "@lekoarts/gatsby-theme-minimal-blog/src/components/tags"
type Props = {
  data: {
    allPost: {
      group: {
        fieldValue: string
        totalCount: number
      }[]
    }
  }
  [key: string]: any
}

export default function MinimalBlogCoreTags({ ...props }: Props) {
  const {
    data: { allPost },
  } = props

  return <Tags list={allPost.group} {...props} />
}

export { Head }
