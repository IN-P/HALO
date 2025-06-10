export function getTotalCommentCount(comments = []) {
  let count = 0;
  for (const c of comments) {
    if (!c) continue;

    // 🔒 차단된 유저의 댓글은 카운트 제외
    if (c.User?.isBlocked || c.User?.isBlockedByMe) continue;

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

    // 🔒 차단된 사용자 댓글은 제외
    if (c.User?.isBlocked || c.User?.isBlockedByMe) continue;

    result.push(c);

    if (Array.isArray(c.replies) && c.replies.length > 0) {
      result = result.concat(flattenComments(c.replies));
    }
  }
  return result;
}

