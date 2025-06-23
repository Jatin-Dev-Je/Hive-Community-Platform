// User Service - handles user-related business logic

const User = require('../models/User');

async function getUsersService(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, category, isMentor, isSeekingMentor, expertise } = query;
  const filter = { isActive: true };
  if (search) filter.$text = { $search: search };
  if (isMentor === 'true') filter.isMentor = true;
  if (isSeekingMentor === 'true') filter.isSeekingMentor = true;
  if (expertise) filter.expertise = { $in: [expertise] };
  const users = await User.find(filter)
    .select('-password')
    .sort({ reputation: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await User.countDocuments(filter);
  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getUserByIdService(id) {
  return User.findById(id)
    .select('-password')
    .populate('postsCount repliesCount milestonesCount');
}

async function searchUsersService(query) {
  const { q, expertise, goals, interests, page, limit } = query;
  const pageNum = parseInt(page) || 1;
  const lim = parseInt(limit) || 10;
  const skip = (pageNum - 1) * lim;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };
  if (expertise) filter.expertise = { $in: [expertise] };
  if (goals) filter.goals = { $in: [goals] };
  if (interests) filter.interests = { $in: [interests] };
  const users = await User.find(filter)
    .select('-password')
    .sort({ reputation: -1 })
    .skip(skip)
    .limit(lim);
  const total = await User.countDocuments(filter);
  return { users, pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) } };
}

async function getMentorsService(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const { expertise, interests } = query;
  const filter = { isActive: true, isMentor: true };
  if (expertise) filter.expertise = { $in: [expertise] };
  if (interests) filter.mentorInterests = { $in: [interests] };
  const mentors = await User.find(filter)
    .select('-password')
    .sort({ reputation: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await User.countDocuments(filter);
  return { mentors, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getMenteesService(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const { goals, interests } = query;
  const filter = { isActive: true, isSeekingMentor: true };
  if (goals) filter.goals = { $in: [goals] };
  if (interests) filter.interests = { $in: [interests] };
  const mentees = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await User.countDocuments(filter);
  return { mentees, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function updateReputationService(id, action) {
  const points = { upvote: 1, downvote: -1, milestone: 5, helpful: 3 };
  const user = await User.findById(id);
  if (!user) return null;
  user.reputation += points[action] || 0;
  await user.save();
  return user.reputation;
}

async function getUserStatsService(id) {
  const user = await User.findById(id)
    .select('postsCount repliesCount milestonesCount reputation createdAt');
  if (!user) return null;
  const daysSinceJoined = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
  const avgReputationPerDay = daysSinceJoined > 0 ? (user.reputation / daysSinceJoined).toFixed(2) : 0;
  return {
    postsCount: user.postsCount,
    repliesCount: user.repliesCount,
    milestonesCount: user.milestonesCount,
    reputation: user.reputation,
    daysSinceJoined,
    avgReputationPerDay: parseFloat(avgReputationPerDay)
  };
}

module.exports = {
  getUsersService,
  getUserByIdService,
  searchUsersService,
  getMentorsService,
  getMenteesService,
  updateReputationService,
  getUserStatsService
}; 