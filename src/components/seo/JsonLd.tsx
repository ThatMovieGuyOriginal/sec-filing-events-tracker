// src/components/seo/JsonLd.tsx
import React from 'react';

export const JsonLd: React.FC<{ data: Record<string, any> }> = ({ data }) => {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
};
