import { Router } from 'express';
import { getDemoMembers } from '../repositories/memberRepository.js';

export const membersRouter = Router();

membersRouter.get('/demo', (_req, res) => {
  const members = getDemoMembers();
  res.json({ members });
});
