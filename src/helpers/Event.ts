import { ClientEvents, Collection } from "discord.js";
import { SparkleClient } from "./Client.js";
import chalk from "chalk";

interface EventHandler<EventName extends keyof ClientEvents> {
    name: string; event: EventName; once?: boolean;
    execute(...args: ClientEvents[EventName]): void;
};

type StoredEvents = Collection<string, EventHandler<keyof ClientEvents>>;

export class Event<EventName extends keyof ClientEvents> {
    public static storage: Collection<keyof ClientEvents, StoredEvents> = new Collection();

    constructor(options: EventHandler<EventName>) {
        const events = Event.storage.get(options.event) ?? new Collection();
        events.set(options.name, options);
        Event.storage.set(options.event, events);
    };

    public static register(client: SparkleClient) {
        for (const [event, stored] of Event.storage) {
            for (const { once, execute } of stored.values()) {
                if (once) client.once(event, execute);
                else client.on(event, execute);
            };
        };
    };

    public static print() {
        console.log(chalk.white.bold('Loading events...'));

        if (!Event.storage.size)
            return console.log(`↳ ${chalk.gray("There's just dust here...")}`);

        for (const [event, stored] of Event.storage)
            stored.forEach(({ name }) => console.log(`↳ ${chalk.green(`${name} ${chalk.bold(event)}`)} loaded`));

        console.log(chalk.white.bold('Finished!'));
    };
};