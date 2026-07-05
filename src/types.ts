/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  email: string;
  token: string;
}

export interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  cardUrl: string;
  videoUrl: string;
  genre: string;
  year: number;
  duration: string;
  rating: string;
  tags: string[];
}
