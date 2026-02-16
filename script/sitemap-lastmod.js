"use strict";

function updateLastmod(xmlContent) {
  const today = new Date().toISOString().slice(0, 10);
  return xmlContent.replace(
    /<lastmod>[^<]*<\/lastmod>/,
    `<lastmod>${today}</lastmod>`,
  );
}

module.exports = { updateLastmod };
