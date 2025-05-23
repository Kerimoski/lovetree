
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  image: 'image',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  role: 'role',
  fcmToken: 'fcmToken'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  body: 'body',
  type: 'type',
  isRead: 'isRead',
  data: 'data',
  createdAt: 'createdAt',
  sentAt: 'sentAt',
  userId: 'userId'
};

exports.Prisma.ConnectionScalarFieldEnum = {
  id: 'id',
  connectionCode: 'connectionCode',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  pairedWithId: 'pairedWithId'
};

exports.Prisma.TreeScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  growthLevel: 'growthLevel',
  lastWatered: 'lastWatered',
  growthXP: 'growthXP',
  connectionId: 'connectionId'
};

exports.Prisma.MemoryScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  imageUrl: 'imageUrl',
  date: 'date',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  connectionId: 'connectionId'
};

exports.Prisma.NoteScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  isTemporary: 'isTemporary',
  expiresAt: 'expiresAt',
  rating: 'rating',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  authorId: 'authorId',
  connectionId: 'connectionId'
};

exports.Prisma.SpecialDayScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  date: 'date',
  isRecurring: 'isRecurring',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isConfirmed: 'isConfirmed',
  confirmedAt: 'confirmedAt',
  confirmedById: 'confirmedById',
  userId: 'userId',
  connectionId: 'connectionId'
};

exports.Prisma.GoalScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  isCompleted: 'isCompleted',
  dueDate: 'dueDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  connectionId: 'connectionId'
};

exports.Prisma.DreamScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  imageUrl: 'imageUrl',
  linkUrl: 'linkUrl',
  category: 'category',
  position: 'position',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  connectionId: 'connectionId'
};

exports.Prisma.DreamCommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  dreamId: 'dreamId',
  userId: 'userId'
};

exports.Prisma.SurpriseScalarFieldEnum = {
  id: 'id',
  imageUrl: 'imageUrl',
  message: 'message',
  createdAt: 'createdAt',
  isSeenByAuthor: 'isSeenByAuthor',
  isSeenByPartner: 'isSeenByPartner',
  userId: 'userId',
  connectionId: 'connectionId'
};

exports.Prisma.TimeCapsuleScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  imageUrl: 'imageUrl',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  openDate: 'openDate',
  isOpened: 'isOpened',
  openedAt: 'openedAt',
  userId: 'userId',
  connectionId: 'connectionId'
};

exports.Prisma.TimeCapsuleCommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  timeCapsuleId: 'timeCapsuleId',
  userId: 'userId'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isRead: 'isRead',
  userId: 'userId',
  connectionId: 'connectionId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  SYSTEM: 'SYSTEM',
  SPECIAL_DAY: 'SPECIAL_DAY',
  NEW_MEMORY: 'NEW_MEMORY',
  NEW_NOTE: 'NEW_NOTE',
  PROMO: 'PROMO',
  APP_UPDATE: 'APP_UPDATE'
};

exports.DreamCategory = exports.$Enums.DreamCategory = {
  TRAVEL: 'TRAVEL',
  HOME: 'HOME',
  FAMILY: 'FAMILY',
  CAREER: 'CAREER',
  ADVENTURE: 'ADVENTURE',
  RELATIONSHIP: 'RELATIONSHIP',
  FINANCE: 'FINANCE',
  HEALTH: 'HEALTH',
  OTHER: 'OTHER'
};

exports.Prisma.ModelName = {
  User: 'User',
  Notification: 'Notification',
  Connection: 'Connection',
  Tree: 'Tree',
  Memory: 'Memory',
  Note: 'Note',
  SpecialDay: 'SpecialDay',
  Goal: 'Goal',
  Dream: 'Dream',
  DreamComment: 'DreamComment',
  Surprise: 'Surprise',
  TimeCapsule: 'TimeCapsule',
  TimeCapsuleComment: 'TimeCapsuleComment',
  ChatMessage: 'ChatMessage'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
