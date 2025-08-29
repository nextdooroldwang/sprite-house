const express = require('express');
const router = express.Router();
const axios = require('axios');
const querystring = require('querystring');

class ApiRoutes {
  constructor(roomManager) {
    this.roomManager = roomManager;
    this.setupRoutes();
  }

  // 获取房间信息
  getRoomInfo(req, res) {
    const { roomId } = req.params;
    const roomInfo = this.roomManager.getRoomInfo(roomId);
    res.json(roomInfo);
  }

  // LINE 登录：重定向到 LINE 授权页
  lineLogin(req, res) {
    try {
      const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
      const redirectUri = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL;
      const state = req.query.state || Math.random().toString(36).slice(2);
      const scope = 'openid profile';

      if (!clientId || !redirectUri) {
        return res.status(500).json({ error: 'LINE 配置缺失: 请设置 NEXT_PUBLIC_LINE_CHANNEL_ID 和 NEXT_PUBLIC_LINE_CALLBACK_URL' });
      }

      const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope
      })}`;

      return res.redirect(authUrl);
    } catch (e) {
      console.error('LINE 登录重定向失败', e);
      return res.status(500).json({ error: 'LINE 登录重定向失败' });
    }
  }

  // 交换授权码为令牌，并返回基础资料
  async exchangeLineToken(req, res) {
    try {
      const { code } = req.body || {};
      const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
      const clientSecret = process.env.LINE_CHANNEL_SECRET;
      const redirectUri = process.env.NEXT_PUBLIC_LINE_CALLBACK_URL;

      if (!code) return res.status(400).json({ error: '缺少授权码 code' });
      if (!clientId || !clientSecret || !redirectUri) {
        return res.status(500).json({ error: 'LINE 配置缺失: 请设置 NEXT_PUBLIC_LINE_CHANNEL_ID / LINE_CHANNEL_SECRET / NEXT_PUBLIC_LINE_CALLBACK_URL' });
      }

      // 1) 用授权码换取令牌
      const tokenResp = await axios.post(
        'https://api.line.me/oauth2/v2.1/token',
        querystring.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { id_token, access_token } = tokenResp.data || {};

      // 2) 校验 id_token 并获取用户信息
      const verifyResp = await axios.post(
        'https://api.line.me/oauth2/v2.1/verify',
        querystring.stringify({ id_token, client_id: clientId }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const profile = {
        userId: verifyResp.data.sub,
        name: verifyResp.data.name,
        picture: verifyResp.data.picture,
      };

      return res.json({ ok: true, profile, id_token, access_token });
    } catch (e) {
      console.error('交换 LINE 令牌失败', e?.response?.data || e.message);
      return res.status(500).json({ error: '交换 LINE 令牌失败', detail: e?.response?.data || e.message });
    }
  }

  // 设置路由
  setupRoutes() {
    router.get('/rooms/:roomId', (req, res) => this.getRoomInfo(req, res));
    router.get('/auth/line/login', (req, res) => this.lineLogin(req, res));
    router.post('/auth/line/token', (req, res) => this.exchangeLineToken(req, res));
  }

  // 获取路由器
  getRouter() {
    return router;
  }
}

module.exports = ApiRoutes;