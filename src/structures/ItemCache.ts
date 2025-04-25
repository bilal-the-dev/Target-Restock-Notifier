class ItemCache {
  #productMap = new Map<string, any[]>();

  getItems(channelId: string) {
    return this.#productMap.get(channelId) ?? [];
  }

  setItems(channelId: string, items: any[]) {
    this.#productMap.set(channelId, items);
  }

  addItems(channelId: string, items: any[]) {
    const oldItems = this.#productMap.get(channelId) ?? [];

    this.#productMap.set(channelId, [oldItems, ...items]);
  }
}

export default new ItemCache();
