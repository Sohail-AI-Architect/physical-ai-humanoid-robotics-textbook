import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import ChapterActions from '../ChapterActions';

type Props = WrapperProps<typeof Layout>;

export default function LayoutWrapper(props: Props): React.JSX.Element {
  const { metadata } = useDoc();
  const slug = metadata.slug || metadata.id || 'unknown';

  return (
    <>
      <ChapterActions chapterSlug={slug} />
      <Layout {...props} />
    </>
  );
}
