import axios from 'axios';
import * as cheerio from 'cheerio';
import { AppError } from '../utils/apiResponse.js';

const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'file:'];

export const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    if (BLOCKED_PROTOCOLS.some((p) => urlString.toLowerCase().startsWith(p))) return false;
    return true;
  } catch {
    return false;
  }
};

export const scrapeWebpage = async (url) => {
  if (!isValidUrl(url)) {
    throw new AppError('Invalid URL. Please provide a valid http or https URL.', 400);
  }

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ContentSummarizerBot/1.0; +https://github.com/content-summarizer)',
        Accept: 'text/html,application/xhtml+xml',
      },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const $ = cheerio.load(response.data);

    $('script, style, noscript, iframe, svg, nav, footer, header, aside, form').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || 'Webpage';
    const metaDesc = $('meta[name="description"]').attr('content') || '';

    const paragraphs = [];
    $('article p, main p, .content p, p').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 40) paragraphs.push(text);
    });

    let bodyText = paragraphs.join('\n\n');

    if (bodyText.length < 200) {
      bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    }

    const content = [metaDesc, bodyText].filter(Boolean).join('\n\n').trim();

    if (!content || content.length < 100) {
      throw new AppError('Could not extract enough text from this webpage.', 422);
    }

    return {
      title,
      content: content.slice(0, 50000),
      url,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new AppError('Could not reach the URL. Check that it is correct and publicly accessible.', 400);
    }
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new AppError('Access to this webpage was denied.', 403);
    }
    throw new AppError(`Failed to fetch webpage: ${error.message}`, 400);
  }
};
