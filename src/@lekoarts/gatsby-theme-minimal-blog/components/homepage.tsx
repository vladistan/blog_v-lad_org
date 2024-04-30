import * as React from "react"
import { navigate } from "gatsby"

export default function MinimalBlogCoreHomepage() {
  React.useEffect(() => {
    navigate('/blog');
  }, []);

  return null;
}
