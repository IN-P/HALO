// utils/getReportedUserId.js
const { TargetType, Post, Comment } = require('../../models');

async function getReportedUserId(target_type_id, target_id) {
  const targetType = await TargetType.findByPk(target_type_id);
  if (!targetType) throw new Error('Invalid target_type_id');

  switch (targetType.code) {
    case 'POST': {
      const post = await Post.findByPk(target_id);
      if (!post) throw new Error('Post not found');
      return post.user_id;
    }

    case 'COMMENT': {
      const comment = await Comment.findByPk(target_id);
      if (!comment) throw new Error('Comment not found');
      return comment.user_id;
    }

    case 'USER':
      return target_id;

    case 'CHAT': { 
      const chat = await Chat.findByPk(target_id);
      if (!chat) throw new Error('Chat not found');
      return chat.user_id; // 또는 sender_id 등 정확한 필드로
    }

    default:
      throw new Error('Unknown target type');
  }
}

module.exports = getReportedUserId;
