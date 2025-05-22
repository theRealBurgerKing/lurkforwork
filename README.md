# LurkForWork - Professional Social Network Platform
*A LinkedIn-inspired Professional Networking Platform - 基于 LinkedIn 的专业社交网络平台*

## Project Overview / 项目概述

LurkForWork is a comprehensive professional social networking platform inspired by LinkedIn, designed to connect professionals and facilitate job opportunities. Built with vanilla JavaScript, this platform offers a complete social networking experience with job posting, user interaction, and professional networking capabilities.

LurkForWork 是一个受 LinkedIn 启发的综合性专业社交网络平台，旨在连接专业人士并促进就业机会。该平台使用原生 JavaScript 构建，提供完整的社交网络体验，包括职位发布、用户互动和专业网络功能。

## Technology Stack / 技术栈

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Node.js Express Server (provided)
- **Authentication**: JWT-based user authentication
- **Data Storage**: RESTful API integration
- **File Handling**: Base64 image encoding and file uploads
- **Real-time Features**: Polling-based live updates and notifications

## Core Features / 核心功能

### 1. User Authentication & Management / 用户认证与管理

**Secure Registration & Login System / 安全注册与登录系统**
- Email-based user registration with password confirmation
- 基于邮箱的用户注册，包含密码确认功能
- Secure login functionality with JWT token management
- 安全登录功能，采用 JWT 令牌管理
- Comprehensive error handling with user-friendly popup messages
- 全面的错误处理，提供用户友好的弹窗消息
- Automatic session management and logout functionality
- 自动会话管理和登出功能

**Profile Management / 个人资料管理**
- Complete user profile creation and editing
- 完整的用户资料创建和编辑功能
- Professional image upload and management
- 专业头像上传和管理
- Personal information updates (email, password, name)
- 个人信息更新（邮箱、密码、姓名）
- Profile visibility and professional presentation
- 个人资料可见性和专业展示

### 2. Professional Job Feed System / 专业职位信息流系统

**Dynamic Job Feed / 动态职位信息流**
- Chronologically ordered job postings (most recent first)
- 按时间顺序排列的职位发布（最新优先）
- Rich job content display including:
- 丰富的职位内容展示，包括：
  - Professional job images (base64 format)
  - 专业职位图片（base64 格式）
  - Comprehensive job descriptions and requirements
  - 全面的职位描述和要求
  - Job start dates and duration information
  - 职位开始日期和持续时间信息
  - Author information and posting timestamps
  - 作者信息和发布时间戳

**Smart Time Display / 智能时间显示**
- Recent posts show "X hours/minutes ago" (within 24 hours)
- 最近发布显示"X 小时/分钟前"（24 小时内）
- Older posts display formatted date (DD/MM/YYYY)
- 较早发布显示格式化日期（日/月/年）

### 3. Social Interaction Features / 社交互动功能

**Like & Comment System / 点赞与评论系统**
- One-click job liking with real-time updates
- 一键职位点赞，实时更新
- Comprehensive commenting system with author attribution
- 全面的评论系统，包含作者归属
- Like and comment count display
- 点赞和评论数量显示
- Interactive user engagement tracking
- 交互式用户参与度跟踪

### 4. Professional Networking / 专业网络建设

**User Profile System / 用户资料系统**
- Comprehensive user profiles with professional information
- 包含专业信息的全面用户资料
- Individual user job history and portfolio display
- 个人用户工作历史和作品展示
- Professional connection tracking and statistics
- 专业联系跟踪和统计

**Watch/Follow Functionality / 关注功能**
- Professional connection management (watch/unwatch users)
- 专业联系管理（关注/取消关注用户）
- Follower and following count display
- 粉丝和关注数量显示
- Email-based user discovery and connection
- 基于邮箱的用户发现和连接

### 5. Content Creation & Management / 内容创建与管理

**Job Posting System / 职位发布系统**
- Comprehensive job creation interface with:
- 全面的职位创建界面，包含：
  - Professional job titles and descriptions
  - 专业职位标题和描述
  - Start date specification (DD/MM/YYYY format)
  - 开始日期指定（日/月/年格式）
  - Job-related image uploads
  - 职位相关图片上传
  - Detailed requirement specifications
  - 详细要求规格

**Content Management / 内容管理**
- Edit and update existing job posts
- 编辑和更新现有职位发布
- Delete job posts with proper authorization
- 删除职位发布，具备适当的授权机制
- Author-only content modification controls
- 仅作者可修改内容的控制

## Advanced Features / 高级功能

### 6. Enhanced User Experience / 增强用户体验

**Infinite Scroll Technology / 无限滚动技术**
- Progressive content loading without pagination
- 无分页的渐进式内容加载
- Smooth scrolling experience with optimized performance
- 流畅滚动体验，性能优化
- Efficient data fetching and memory management
- 高效的数据获取和内存管理

**Live Update System / 实时更新系统**
- Real-time like and comment updates without page refresh
- 无需刷新页面的实时点赞和评论更新
- Polling-based live data synchronization
- 基于轮询的实时数据同步
- Immediate user interaction feedback
- 即时用户交互反馈

### 7. Push Notification System / 推送通知系统

**Professional Activity Notifications / 专业活动通知**
- Real-time notifications when followed users post jobs
- 关注用户发布职位时的实时通知
- Custom browser notifications or in-app popups
- 自定义浏览器通知或应用内弹窗
- Intelligent notification management and filtering
- 智能通知管理和过滤

## Technical Architecture / 技术架构

### Frontend Architecture / 前端架构
- **Modular Design**: Component-based vanilla JavaScript architecture
- **模块化设计**：基于组件的原生 JavaScript 架构
- **State Management**: Efficient DOM manipulation and state tracking
- **状态管理**：高效的 DOM 操作和状态跟踪
- **API Integration**: RESTful API communication with proper error handling
- **API 集成**：RESTful API 通信，具备完善的错误处理

### Data Flow / 数据流
- **Authentication Flow**: JWT token-based session management
- **认证流程**：基于 JWT 令牌的会话管理
- **Content Rendering**: Dynamic content generation and updates
- **内容渲染**：动态内容生成和更新
- **User Interactions**: Event-driven interaction handling
- **用户交互**：事件驱动的交互处理

## User Journey Examples / 用户旅程示例

### Professional User Workflow / 专业用户工作流
1. **Account Creation** → **账户创建**
   - Register with professional email and credentials
   - 使用专业邮箱和凭证注册

2. **Profile Setup** → **个人资料设置**
   - Upload professional photo and complete profile
   - 上传专业照片并完善个人资料

3. **Network Building** → **网络建设**
   - Discover and follow industry professionals
   - 发现并关注行业专业人士

4. **Content Engagement** → **内容参与**
   - Browse job feed, like and comment on opportunities
   - 浏览职位信息流，点赞和评论机会

5. **Job Posting** → **职位发布**
   - Create and publish job opportunities
   - 创建并发布职位机会

6. **Professional Networking** → **专业网络建设**
   - View profiles, connect with professionals
   - 查看资料，与专业人士建立联系

### Job Seeker Workflow / 求职者工作流
1. **Platform Access** → **平台访问**
2. **Job Discovery** → **职位发现**
3. **Application Engagement** → **申请参与**
4. **Professional Connection** → **专业联系**
5. **Career Development** → **职业发展**

## Project Goals / 项目目标

LurkForWork demonstrates advanced vanilla JavaScript development capabilities while creating a comprehensive professional networking platform. The project showcases:

LurkForWork 展示了高级原生 JavaScript 开发能力，同时创建了一个全面的专业网络平台。该项目展示了：

**Technical Excellence / 技术卓越**
- Modern JavaScript ES6+ features and best practices
- 现代 JavaScript ES6+ 特性和最佳实践
- Efficient DOM manipulation and state management
- 高效的 DOM 操作和状态管理  
- RESTful API integration and error handling
- RESTful API 集成和错误处理

**User Experience Focus / 用户体验关注**
- Intuitive professional networking interface
- 直观的专业网络界面
- Real-time interactions and updates
- 实时交互和更新
- Mobile-responsive design principles
- 移动响应式设计原则

**Professional Application / 专业应用**
- Industry-standard authentication and security
- 行业标准的认证和安全性
- Scalable architecture for professional use
- 专业使用的可扩展架构
- Comprehensive feature set for networking professionals
- 为网络专业人士提供的全面功能集

This platform serves as both a demonstration of advanced web development skills and a functional professional networking tool suitable for career development, job discovery, and professional relationship building.
该平台既是高级 Web 开发技能的展示，也是适用于职业发展、职位发现和专业关系建设的功能性专业网络工具。

## Deployment / 部署
### Backend Setup Instructions / 后端部署

Step 1: Create Backend Directory / 创建后端仓库

Create a new backend folder in your current directory

mkdir backend

Navigate into the backend folder

cd backend

Step 2: Clone the Backend Repository / 克隆后端仓库

Clone the backend repository into the current directory

git clone git@nw-syd-gitlab.cseunsw.tech:COMP6080/25T1/ass3-backend.git

Step 3: Install Dependencies / 安装依赖

Install all required Node.js packages

npm install

Step 4: Start the Backend Server / 启动后端服务器

Start the Express server

npm start

### Frontend Setup Instructions / 前端部署

Step 1: Install global HTTP server (one-time setup) / 安装全局 HTTP 服务器（一次性设置）

npm install --global http-server

Step 2: Start development server / 启动开发服务器
npx http-server frontend -c 1 -p [port]
