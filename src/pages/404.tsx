import * as React from "react"
import type { PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"

const NotFound = (_props: PageProps) => (
  <Layout>
    <h1>404 - Page Not Found</h1>
    <p>Well, this is awkward. Whatever you were looking for seems to have done a Houdini on us!</p>
  </Layout>
)

export default NotFound
