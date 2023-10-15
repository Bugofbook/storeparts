type BasicEntity = {
    id: string;
};
export default function createEntityPart<Entity extends BasicEntity = BasicEntity>(initialEntities: Array<Entity> = []) {
    let ids: string[] = initialEntities.map((entity) => entity.id);
    const entitiesMap: Map<string, Entity> = new Map(
        initialEntities.map((entity) => [entity.id, entity])
    );
    /**
     *
     * @param entity
     * @returns {String}
     */
    const getID = (entity: BasicEntity) => entity.id;
    /**
     * check entity exist
     * @param id
     * @returns {Boolean}
     */
    const entityExist = (id: string) => {
        return entitiesMap.has(id);
    };
    /**
     * if entity not exist, add it
     * @param entity
     */
    const addOne = (entity: Entity) => {
        const id = getID(entity);
        if (!ids.includes(id)) {
            ids = ids.concat([id]);
            entitiesMap.set(id, entity);
        }
    };
    /**
     * if entities not exist, add it
     * @param entities
     */
    const addMany = (entities: Entity[]) => {
        entities.forEach((entity) => {
            const id = getID(entity);
            if (!ids.includes(id)) {
                ids = ids.concat([id]);
                entitiesMap.set(id, entity);
            }
        });
    };
    /**
     * if entity exist, replace it, or add it
     * @param entity
     */
    const setOne = (entity: Entity) => {
        const id = getID(entity);
        entitiesMap.set(id, entity);
        if (!ids.includes(id)) {
            ids.concat([id]);
        }
    };
    /**
     * if entities exist, replace it, or add it
     * @param entities
     */
    const setMany = (entities: Entity[]) => {
        entities.forEach((entity) => {
            const id = getID(entity);
            entitiesMap.set(id, entity);
            if (!ids.includes(id)) {
                ids.concat([id]);
            }
        });
    };
    /**
     * replace all entities
     * @param entities
     */
    const setAll = (entities: Entity[]) => {
        entitiesMap.clear();
        entities.forEach((entity) => {
            const id = getID(entity);
            entitiesMap.set(id, entity);
        });
        ids = entities.map((entity) => getID(entity));
    };
    /**
     * if entity exist, update it, or add it
     * @param entity
     */
    const upsertOne = (entity: Entity) => {
        const id = getID(entity);
        if (!entityExist(id)) {
            const newEntity = entity;
            entitiesMap.set(id, newEntity);
            ids.concat([id]);
        } else {
            const oldEntity = getOne(id);
            const newEntity: Entity = Object.assign({}, oldEntity, entity);
            entitiesMap.set(id, newEntity);
        }
    };
    /**
     * if entities exist, update it, or add it
     * @param entities
     */
    const upsertMany = (entities: Array<Entity>) => {
        entities.forEach((entity) => {
            const id = getID(entity);
            if (!entityExist(id)) {
                const newEntity = entity;
                entitiesMap.set(id, newEntity);
                ids.concat([id]);
            } else {
                const oldEntity = getOne(id);
                const newEntity: Entity = Object.assign({}, oldEntity, entity);
                entitiesMap.set(id, newEntity);
            }
        });
    };
    /**
     * if entity exist, update it, or do nothing
     * @param entity
     */
    const updateOne = (entity: BasicEntity & Partial<Omit<Entity, keyof BasicEntity>>) => {
        const id = getID(entity);
        if (entityExist(id)) {
            const oldEntity = getOne(id);
            const newEntity: Entity = Object.assign({}, oldEntity, entity);
            entitiesMap.set(id, newEntity);
        }
    };
    /**
     * if entities exist, update it, or do nothing
     * @param entities
     */
    const updateMany = (entities: Array<BasicEntity & Partial<Omit<Entity, keyof BasicEntity>>>) => {
        entities.forEach((entity) => {
            const id = getID(entity);
            if (entityExist(id)) {
                const oldEntity = getOne(id);
                const newEntity: Entity = Object.assign({}, oldEntity, entity);
                entitiesMap.set(id, newEntity);
            }
        });
    };
    /**
     * if entity exist, remove it, or do nothing
     * @param id
     */
    const removeOne = (id: string) => {
        if (entityExist(id)) {
            entitiesMap.delete(id);
            ids = ids.filter((_id) => _id !== id);
        }
    }
    /**
     * if entities exist, remove it, or do nothing
     * @param ids
     */
    const removeMany = (ids: string[]) => {
        ids.forEach((id) => {
            if (entityExist(id)) {
                entitiesMap.delete(id);
            }
        });
        ids = ids.filter((_id) => !ids.includes(_id));
    }
    /**
     * remove all entities
     */
    const removeAll = () => {
        entitiesMap.clear();
        ids = [];
    }
    /**
     * initialize all entities
     */
    const initialize = () => {
        entitiesMap.clear();
        ids = initialEntities.map((entity) => entity.id);
        initialEntities.forEach((entity) => {
            entitiesMap.set(entity.id, entity);
        });
    }
    /**
     * get all id of entities, it is immutable
     * @returns
     */
    const getIDs = () => {
        return ids;
    };
    /**
     * get one Entity, it is immutable
     * @param id
     * @returns
     */
    const getOne = (id: string) => {
        if (entityExist(id)) {
            return entitiesMap.get(id) as Entity;
        } else {
            console.warn(`Entity with id=${id} not exist`);
            return null;
        }
    };
    /**
     * get many Entities, it is mutable
     * @param ids
     * @returns
     */
    const getMany = (ids: string[]) => {
        return ids.map((id) => getOne(id));
    }
    /**
     * get all Entities, it is mutable
     * @returns
     */
    const getAll = () => {
        return ids.map((id) => getOne(id));
    }
    return {
        getIDs,
        getOne,
        getMany,
        getAll,
        addOne,
        addMany,
        setOne,
        setMany,
        setAll,
        updateOne,
        updateMany,
        upsertOne,
        upsertMany,
        removeOne,
        removeMany,
        removeAll,
        initialize,
    };
}
