const createChatroomIdentifier = (firstUserId, secondUserId) => {
  const participants = [firstUserId, secondUserId];
  participants.sort();
  return participants.join('-');
};

module.exports = createChatroomIdentifier;
