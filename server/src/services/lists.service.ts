import { PrismaClient, GroceryList, GroceryItem } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateListData {
  name: string;
  description?: string;
  items?: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    category?: string;
    completed?: boolean;
  }>;
}

export interface UpdateListData {
  name?: string;
  description?: string;
}

export interface CreateItemData {
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
}

export interface UpdateItemData {
  name?: string;
  quantity?: number;
  unit?: string;
  category?: string;
  completed?: boolean;
}

export type ListWithItems = GroceryList & {
  items: GroceryItem[];
};

export class ListsService {
  async getAllLists(userId: string): Promise<ListWithItems[]> {
    return await prisma.groceryList.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getListById(id: string, userId: string): Promise<ListWithItems | null> {
    return await prisma.groceryList.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async createList(userId: string, data: CreateListData): Promise<ListWithItems> {
    return await prisma.groceryList.create({
      data: {
        name: data.name,
        description: data.description || null,
        userId,
        items: {
          create: (data.items || []).map((item) => ({
            name: item.name,
            quantity: item.quantity || 1,
            unit: item.unit || 'шт.',
            category: item.category || null,
            completed: item.completed || false,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async updateList(id: string, userId: string, data: UpdateListData): Promise<ListWithItems> {
    const existingList = await prisma.groceryList.findFirst({
      where: { id, userId },
    });

    if (!existingList) {
      throw new Error('Список не найден');
    }

    return await prisma.groceryList.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description !== undefined ? data.description : null,
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async deleteList(id: string, userId: string): Promise<void> {
    const existingList = await prisma.groceryList.findFirst({
      where: { id, userId },
    });

    if (!existingList) {
      throw new Error('Список не найден');
    }

    await prisma.groceryList.delete({
      where: { id },
    });
  }

  async addItemToList(listId: string, userId: string, data: CreateItemData): Promise<GroceryItem> {
    const list = await prisma.groceryList.findFirst({
      where: { id: listId, userId },
    });

    if (!list) {
      throw new Error('Список не найден');
    }

    return await prisma.groceryItem.create({
      data: {
        name: data.name,
        quantity: data.quantity || 1,
        unit: data.unit || 'шт.',
        category: data.category || null,
        listId,
      },
    });
  }

  async updateItem(
    listId: string,
    itemId: string,
    userId: string,
    data: UpdateItemData
  ): Promise<GroceryItem> {
    const list = await prisma.groceryList.findFirst({
      where: { id: listId, userId },
    });

    if (!list) {
      throw new Error('Список не найден');
    }

    const existingItem = await prisma.groceryItem.findFirst({
      where: { id: itemId, listId },
    });

    if (!existingItem) {
      throw new Error('Товар не найден');
    }

    return await prisma.groceryItem.update({
      where: { id: itemId },
      data: {
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
        completed: data.completed,
      },
    });
  }

  async deleteItem(listId: string, itemId: string, userId: string): Promise<void> {
    const list = await prisma.groceryList.findFirst({
      where: { id: listId, userId },
    });

    if (!list) {
      throw new Error('Список не найден');
    }

    const existingItem = await prisma.groceryItem.findFirst({
      where: { id: itemId, listId },
    });

    if (!existingItem) {
      throw new Error('Товар не найден');
    }

    await prisma.groceryItem.delete({
      where: { id: itemId },
    });
  }

  async toggleItemStatus(listId: string, itemId: string, userId: string): Promise<GroceryItem> {
    const list = await prisma.groceryList.findFirst({
      where: { id: listId, userId },
    });

    if (!list) {
      throw new Error('Список не найден');
    }

    const existingItem = await prisma.groceryItem.findFirst({
      where: { id: itemId, listId },
    });

    if (!existingItem) {
      throw new Error('Товар не найден');
    }

    return await prisma.groceryItem.update({
      where: { id: itemId },
      data: {
        completed: !existingItem.completed,
      },
    });
  }

  // Публичный метод - без проверки userId
  async getPublicListById(id: string): Promise<ListWithItems | null> {
    return await prisma.groceryList.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}

