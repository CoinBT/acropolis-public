export function visibleArticle(article, unlocked = false) {
  return {...article, title: unlocked ? article.secretTitle || article.title : article.title,
    secretTitle: undefined,
    blocks: article.blocks.filter(b => unlocked || !b.secret).map(b => b.type === 'table' ? {...b, rows: b.rows.filter((_, i) => unlocked || !b.secretRows?.[i]), secretRows: undefined} : {...b}).filter(b => b.type !== 'table' || b.rows.length > 0)};
}
export const normalize = value => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, '');
export function searchArticles(articles, query, category = '', unlocked = false) {
  const q = normalize(query);
  return articles.map(a => visibleArticle(a, unlocked)).filter(a => (!category || a.category === category) && normalize([a.title, a.summary, ...a.blocks.map(b => b.text || b.rows.flat().join(' '))].join(' ')).includes(q));
}
