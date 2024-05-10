type BasicEntity = {
    id: string;
};

export type EntityPart<Entity extends BasicEntity = BasicEntity> = {
    /**
     * @description get all id of entities, it is stable
     * @returns {String[]}
     */
    getIDs: () => string[];
    /**
     * @description check entity exist
     * @param {String} id 
     * @returns {Boolean}
     */
    entityExist: (id: string) => boolean;
    /**
     * @description get one Entity, it is stable
     * @param id 
     * @returns {Entity | undefined}
     */
    getOne: (id: string) => Entity | undefined;
    /**
     * @description get many Entities, it is unstable
     * @param ids 
     * @returns {Entity[]}
     */
    getMany: (ids: string[]) => Entity[];
    /**
     * @description get all Entities, it is unstable
     * @returns {Entity[]}
     */
    getAll: () => Entity[];
    /**
     * @description add one Entity, if it not exist
     * @param entity {Entity}
     * @returns 
     */
    addOne: (entity: Entity) => void;
    /**
     * @description add many Entities, if it not exist
     * @param entities {Entity[]}
     * @returns 
     */
    addMany: (entities: Entity[]) => void;
    /**
     * @description set one Entity, if it exist, or add it
     * @param entity 
     * @returns 
     */
    setOne: (entity: Entity) => void;
    /**
     * @description set many Entities, if it exist, or add it
     * @param entities {Entity[]}
     * @returns 
     */
    setMany: (entities: Entity[]) => void;
    /**
     * @description set all Entities, it will replace all entities
     * @param entities {Entity[]}
     * @returns 
     */
    setAll: (entities: Entity[]) => void;
    updateOne: (entity: Entity) => void;
    updateMany: (entities: Entity[]) => void;
    upsertOne: (entity: Entity) => void;
    upsertMany: (entities: Entity[]) => void;
    removeOne: (id: string) => void;
    removeMany: (ids: string[]) => void;
    removeAll: () => void;
    // clear
    initialize: () => void;
}
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
            ids = ids.concat([id]);
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
                ids = ids.concat([id]);
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
            ids = ids.concat([id]);
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
                ids = ids.concat([id]);
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
     * @param removeIDs 
     */
    const removeMany = (removeIDs: string[]) => {
        ids = removeIDs.filter((_id) => !ids.includes(_id));
        removeIDs.forEach((id) => {
            if (entityExist(id)) {
                entitiesMap.delete(id);
            }
        });
    }
    /**
     * remove all entities
     */
    const removeAll = () => {
        ids = [];
        entitiesMap.clear();
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
     * get all id of entities, it is stable
     * @returns 
     */
    const getIDs = () => {
        return ids;
    };
    /**
     * get one Entity, it is stable
     * @param id 
     * @returns 
     */
    const getOne = (id: string) => {
        return entitiesMap.get(id)
    };
    /**
     * get many Entities, it is unstable
     * @param ids 
     * @returns 
     */
    const getMany = (ids: string[]) => {
        return ids.map((id) => getOne(id));
    }
    /**
     * get all Entities, it is unstable
     * @returns 
     */
    const getAll = () => {
        return ids.map((id) => getOne(id));
    }
    return {
        // IDs
        getIDs,
        // Entity
        entityExist,
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
        // clear
        initialize,
    };
}