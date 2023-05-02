import { SerializableMember, SerializableObject } from "@openhps/core";
import { foaf, vcard } from "@openhps/rdf";

@SerializableObject({
    rdf: {
        type: foaf.Person
    }
})
export class User {
    @SerializableMember({
        rdf: {
            predicates: [vcard.given_name, foaf.name]
        }
    })
    firstName: string;
    lastName: string;
}
