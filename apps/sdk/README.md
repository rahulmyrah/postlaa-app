# Postlaa NodeJS SDK

This is the NodeJS SDK for [Postlaa](https://postlaa.com).

You can start by installing the package:

```bash
npm install @Postlaa/node
```

## Usage
```typescript
import Postlaa from '@Postlaa/node';
const Postlaa = new Postlaa('your api key', 'your self-hosted instance (optional)');
```

The available methods are:
- `post(posts: CreatePostDto)` - Schedule a post to Postlaa
- `postList(filters: GetPostsDto)` - Get a list of posts
- `upload(file: Buffer, extension: string)` - Upload a file to Postlaa
- `integrations()` - Get a list of connected channels
- `deletePost(id: string)` - Delete a post by ID

Alternatively you can use the SDK with curl, check the [Postlaa API documentation](https://docs.postlaa.com/public-api) for more information.