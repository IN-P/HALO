export function getTotalCommentCount(comments = []) {
  let count = 0;
  for (const c of comments) {
    if (!c) continue;
    count += 1;
    if (Array.isArray(c.replies) && c.replies.length > 0) {
      count += getTotalCommentCount(c.replies);
    }
  }
  return count;
}

export function flattenComments(comments = []) {
  let result = [];
  for (const c of comments) {
    if (!c) continue;
    result.push(c);
    if (Array.isArray(c.replies) && c.replies.length > 0) {
      result = result.concat(flattenComments(c.replies));
    }
  }
  return result;
}