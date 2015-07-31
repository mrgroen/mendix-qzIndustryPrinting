// This file was generated by Mendix Business Modeler.
//
// WARNING: Code you write here will be lost the next time you deploy the project.

package qzindustryprinting.proxies;

import com.mendix.core.Core;
import com.mendix.core.CoreException;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixIdentifier;
import com.mendix.systemwideinterfaces.core.IMendixObject;

/**
 * 
 */
public class Command
{
	private final IMendixObject commandMendixObject;

	private final IContext context;

	/**
	 * Internal name of this entity
	 */
	public static final String entityName = "qzIndustryPrinting.Command";

	/**
	 * Enum describing members of this entity
	 */
	public enum MemberNames
	{
		JSON("JSON"),
		Command_User("qzIndustryPrinting.Command_User");

		private String metaName;

		MemberNames(String s)
		{
			metaName = s;
		}

		@Override
		public String toString()
		{
			return metaName;
		}
	}

	public Command(IContext context)
	{
		this(context, Core.instantiate(context, "qzIndustryPrinting.Command"));
	}

	protected Command(IContext context, IMendixObject commandMendixObject)
	{
		if (commandMendixObject == null)
			throw new IllegalArgumentException("The given object cannot be null.");
		if (!Core.isSubClassOf("qzIndustryPrinting.Command", commandMendixObject.getType()))
			throw new IllegalArgumentException("The given object is not a qzIndustryPrinting.Command");

		this.commandMendixObject = commandMendixObject;
		this.context = context;
	}

	/**
	 * @deprecated Use 'Command.load(IContext, IMendixIdentifier)' instead.
	 */
	@Deprecated
	public static qzindustryprinting.proxies.Command initialize(IContext context, IMendixIdentifier mendixIdentifier) throws CoreException
	{
		return qzindustryprinting.proxies.Command.load(context, mendixIdentifier);
	}

	/**
	 * Initialize a proxy using context (recommended). This context will be used for security checking when the get- and set-methods without context parameters are called.
	 * The get- and set-methods with context parameter should be used when for instance sudo access is necessary (IContext.getSudoContext() can be used to obtain sudo access).
	 */
	public static qzindustryprinting.proxies.Command initialize(IContext context, IMendixObject mendixObject)
	{
		return new qzindustryprinting.proxies.Command(context, mendixObject);
	}

	public static qzindustryprinting.proxies.Command load(IContext context, IMendixIdentifier mendixIdentifier) throws CoreException
	{
		IMendixObject mendixObject = Core.retrieveId(context, mendixIdentifier);
		return qzindustryprinting.proxies.Command.initialize(context, mendixObject);
	}

	/**
	 * Commit the changes made on this proxy object.
	 */
	public final void commit() throws CoreException
	{
		Core.commit(context, getMendixObject());
	}

	/**
	 * Commit the changes made on this proxy object using the specified context.
	 */
	public final void commit(IContext context) throws CoreException
	{
		Core.commit(context, getMendixObject());
	}

	/**
	 * Delete the object.
	 */
	public final void delete()
	{
		Core.delete(context, getMendixObject());
	}

	/**
	 * Delete the object using the specified context.
	 */
	public final void delete(IContext context)
	{
		Core.delete(context, getMendixObject());
	}
	/**
	 * @return value of JSON
	 */
	public final String getJSON()
	{
		return getJSON(getContext());
	}

	/**
	 * @param context
	 * @return value of JSON
	 */
	public final String getJSON(IContext context)
	{
		return (String) getMendixObject().getValue(context, MemberNames.JSON.toString());
	}

	/**
	 * Set value of JSON
	 * @param json
	 */
	public final void setJSON(String json)
	{
		setJSON(getContext(), json);
	}

	/**
	 * Set value of JSON
	 * @param context
	 * @param json
	 */
	public final void setJSON(IContext context, String json)
	{
		getMendixObject().setValue(context, MemberNames.JSON.toString(), json);
	}

	/**
	 * @return value of Command_User
	 */
	public final system.proxies.User getCommand_User() throws CoreException
	{
		return getCommand_User(getContext());
	}

	/**
	 * @param context
	 * @return value of Command_User
	 */
	public final system.proxies.User getCommand_User(IContext context) throws CoreException
	{
		system.proxies.User result = null;
		IMendixIdentifier identifier = getMendixObject().getValue(context, MemberNames.Command_User.toString());
		if (identifier != null)
			result = system.proxies.User.load(context, identifier);
		return result;
	}

	/**
	 * Set value of Command_User
	 * @param command_user
	 */
	public final void setCommand_User(system.proxies.User command_user)
	{
		setCommand_User(getContext(), command_user);
	}

	/**
	 * Set value of Command_User
	 * @param context
	 * @param command_user
	 */
	public final void setCommand_User(IContext context, system.proxies.User command_user)
	{
		if (command_user == null)
			getMendixObject().setValue(context, MemberNames.Command_User.toString(), null);
		else
			getMendixObject().setValue(context, MemberNames.Command_User.toString(), command_user.getMendixObject().getId());
	}

	/**
	 * @return the IMendixObject instance of this proxy for use in the Core interface.
	 */
	public final IMendixObject getMendixObject()
	{
		return commandMendixObject;
	}

	/**
	 * @return the IContext instance of this proxy, or null if no IContext instance was specified at initialization.
	 */
	public final IContext getContext()
	{
		return context;
	}

	@Override
	public boolean equals(Object obj)
	{
		if (obj == this)
			return true;

		if (obj != null && getClass().equals(obj.getClass()))
		{
			final qzindustryprinting.proxies.Command that = (qzindustryprinting.proxies.Command) obj;
			return getMendixObject().equals(that.getMendixObject());
		}
		return false;
	}

	@Override
	public int hashCode()
	{
		return getMendixObject().hashCode();
	}

	/**
	 * @return String name of this class
	 */
	public static String getType()
	{
		return "qzIndustryPrinting.Command";
	}

	/**
	 * @return String GUID from this object, format: ID_0000000000
	 * @deprecated Use getMendixObject().getId().toLong() to get a unique identifier for this object.
	 */
	@Deprecated
	public String getGUID()
	{
		return "ID_" + getMendixObject().getId().toLong();
	}
}
