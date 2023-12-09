import { SerializableMember, SerializableObject } from '@openhps/core';
import { foaf, vcard } from '@openhps/rdf';

@SerializableObject({
    rdf: {
        type: foaf.Person,
    },
})
export class User {
    @SerializableMember({
        rdf: {
            predicates: [vcard.given_name, foaf.name],
        },
    })
    firstName: string;

    @SerializableMember({
        rdf: {
            predicates: [vcard.family_name, foaf.surname],
        },
    })
    lastName: string;
}
