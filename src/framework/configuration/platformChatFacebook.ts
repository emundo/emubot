import { FacebookAdapter } from '../chat_adapter/facebook/FacebookAdapter';
import { FacebookChatConfig } from '../chat_adapter/facebook/facebookConfig';

/**
 * Exemplar configuration of the Facebook adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [Facebook]{@link ../../_build/html/chat_adapter/facebook.html} section of our documentation.
 */
export const platformChatFacebook: FacebookChatConfig = {
    appSecret: 'YOUR_APP_SECRET',
    constructor: FacebookAdapter,
    name: 'facebook',
    pageAccessToken: 'YOUR_PAGE_ACCESS_TOKEN',
    url: 'https://graph.facebook.com/',
    verifyToken: 'YOUR_VERIFY_TOKEN',
    version: 'v3.3',
    webhook_path: '/webhook',
};
